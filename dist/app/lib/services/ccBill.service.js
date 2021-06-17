"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CcBillService = void 0;
const crypto_1 = __importDefault(require("crypto"));
const querystring_1 = __importDefault(require("querystring"));
const ICcBill_1 = require("../../domains/ICcBill");
const notification_1 = require("../../domains/notification");
const balanceRecord_1 = require("../../domains/balanceRecord");
const balanceRecordRefModel_1 = require("../../domains/balanceRecordRefModel");
var EventType = ICcBill_1.ICcBill.EventType;
class CcBillService {
    init(app) {
        app.registerProvider('ccBillService', this);
        this.app = app;
    }
    generateFormUrl(params, metadataObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const metadata = this.toBase64(JSON.stringify(metadataObj));
            const formData = {
                initialPrice: params.price,
                initialPeriod: params.period,
                currencyCode: ICcBill_1.ICcBill.CurrencyCode.USD,
                metadata,
            };
            if (!metadataObj.isDeposit) {
                Object.assign(formData, {
                    recurringPrice: params.price,
                    recurringPeriod: params.period,
                    numRebills: '99',
                });
            }
            const { config: { billing: { clientAccnum, clientSubacc, endpoint, flexId, salt, }, }, } = this.app;
            const formDigest = this.createHash(formData, salt);
            return `${endpoint}/${flexId}?${querystring_1.default.stringify(Object.assign(Object.assign({}, formData), { clientAccnum,
                formDigest,
                clientSubacc }))}`;
        });
    }
    createHash(data, salt) {
        let toHash;
        if (data.recurringPeriod) {
            const recurringDynamicFormData = data;
            toHash = [
                recurringDynamicFormData.initialPrice,
                recurringDynamicFormData.initialPeriod,
                recurringDynamicFormData.recurringPrice,
                recurringDynamicFormData.recurringPeriod,
                recurringDynamicFormData.numRebills,
                recurringDynamicFormData.currencyCode,
                salt,
            ];
        }
        else {
            toHash = [
                data.initialPrice,
                data.initialPeriod,
                data.currencyCode,
                salt,
            ];
        }
        return this.toMd5(toHash.join(''));
    }
    handleEvent(eventType, event) {
        if (eventType === EventType.NewSaleSuccess) {
            return this.onNewSaleSuccess(event);
        }
        else if (eventType === EventType.NewSaleFailure) {
            return this.onNewSaleFailure(event);
        }
        else if (eventType === EventType.Cancellation) {
            return this.onCancellation(event);
        }
        else if (eventType === EventType.Expiration) {
            return this.onExpiration(event);
        }
        else {
            throw new Error(`Unknown event: ${eventType}`);
        }
    }
    onNewSaleSuccess(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { salt, testingMode } = this.app.config.billing;
            const { subscriptionId, timestamp, transactionId, dynamicPricingValidationDigest, billedInitialPrice, } = event;
            if (!testingMode) {
                const calculatedDigest = this.toMd5([subscriptionId, 1, salt].join(''));
                if (calculatedDigest !== dynamicPricingValidationDigest) {
                    throw new Error('Wrong digest');
                }
            }
            const { userId, targetUserId, isDeposit } = this.extractNewSaleData(event);
            if (isDeposit) {
                yield this.applyDeposit(userId, parseFloat(billedInitialPrice));
            }
            else {
                if (!targetUserId) {
                    throw new Error('Incorrect target user id');
                }
                const subscription = {
                    active: true,
                    billing: {
                        subscriptionId,
                        transactionId,
                        purchasedTimestamp: timestamp,
                    },
                    targetUser: targetUserId,
                };
                yield this.applySubscription(userId, targetUserId, subscription);
                yield this.notifyNewSaleResult({ userId, payload: { result: true, targetUserId } });
            }
        });
    }
    onNewSaleFailure(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { failureCode, failureReason } = event;
            const { userId } = this.extractNewSaleData(event);
            if (!userId) {
                throw new Error('No user ID provided');
            }
            yield this.notifyNewSaleResult({
                userId,
                payload: { result: false, errorMessage: `${failureCode}: ${failureReason}` },
            });
        });
    }
    onCancellation(event) {
        return __awaiter(this, void 0, void 0, function* () {
            const { subscriptionId, timestamp } = event;
            const user = yield this.cancelSubscription(subscriptionId, timestamp);
            yield this.notifyCancel({
                userId: user._id,
            });
        });
    }
    onExpiration(event) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.onCancellation(event);
        });
    }
    extractNewSaleData(event) {
        const { flexId, 'X-metadata': metadataEncoded } = event;
        if (flexId !== this.app.config.billing.flexId) {
            throw new Error(`Wrong flexId: ${flexId}`);
        }
        if (!metadataEncoded) {
            throw new Error('no metadata provided');
        }
        const metadataStr = this.fromBase64(metadataEncoded);
        return JSON.parse(metadataStr);
    }
    fromBase64(base64) {
        return Buffer
            .from(base64, 'base64')
            .toString('ascii');
    }
    toBase64(str) {
        return Buffer
            .from(str, 'ascii')
            .toString('base64');
    }
    toMd5(str) {
        return crypto_1.default
            .createHash('md5')
            .update(str)
            .digest('hex');
    }
    applyDeposit(userId, billedInitialPrice) {
        return __awaiter(this, void 0, void 0, function* () {
            const { paymentService } = this.app;
            return paymentService.processRecord({
                owner: userId,
                type: balanceRecord_1.BalanceRecordType.Deposit,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Deposit,
                sum: billedInitialPrice,
            });
        });
    }
    applySubscription(userId, targetUserId, subscriptionObj) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modelProvider: { User } } = this.app;
            const targetUser = yield User.findById(targetUserId);
            if (!targetUser) {
                throw new Error(`Wrong targetUser: ${targetUserId}`);
            }
            const result = yield User.updateOne({ _id: userId }, { $pull: { subscriptions: { targetUser: targetUserId } } });
            if (result.nModified <= 0) {
                throw new Error(`Wrong user: ${userId}`);
            }
            yield User.updateOne({ _id: userId }, { $push: { subscriptions: subscriptionObj } });
            yield User.syncSubscriptionsCounters(userId);
            targetUser.subscribers.addToSet(userId);
            targetUser.subscribersCounter = targetUser.subscribers.length;
            return targetUser.save();
        });
    }
    cancelSubscription(subscriptionId, timestamp) {
        return __awaiter(this, void 0, void 0, function* () {
            const { modelProvider: { User } } = this.app;
            const user = yield User.findOneAndUpdate({ 'subscriptions.billing.subscriptionId': subscriptionId }, { $set: { 'subscriptions.$.active': false, 'subscriptions.$.billing.canceledTimestamp': timestamp } });
            if (!user) {
                throw new Error(`Cannot find a user for subscription: ${subscriptionId}`);
            }
            yield User.syncSubscriptionsCounters(user._id);
            const foundSubscription = user.subscriptions
                .find((subscription) => subscription.billing.subscriptionId === subscriptionId);
            yield User.updateOne({ _id: foundSubscription.targetUser }, { $pull: { subscribers: user._id } });
            return user;
        });
    }
    notifyNewSaleResult(params) {
        const { userId, payload } = params;
        this.app.notificationService.createSignal({
            signalType: notification_1.SignalType.PurchaseResult,
            recipients: [userId],
            data: payload,
        });
    }
    notifyCancel(params) {
        const { userId } = params;
        this.app.notificationService.createSignal({
            signalType: notification_1.SignalType.SubscriptionCanceled,
            recipients: [userId],
            data: {},
        });
    }
}
exports.CcBillService = CcBillService;
exports.default = new CcBillService();
//# sourceMappingURL=ccBill.service.js.map