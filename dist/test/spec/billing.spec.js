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
const crypto_1 = __importDefault(require("crypto"));
const chai_1 = require("chai");
const app_1 = __importDefault(require("app"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const balanceRecord_1 = require("app/domains/balanceRecord");
const balanceRecordRefModel_1 = require("app/domains/balanceRecordRefModel");
const ICcBill_1 = require("../../app/domains/ICcBill");
var EventType = ICcBill_1.ICcBill.EventType;
const { config: { billing: { clientAccnum, clientSubacc, flexId, salt, webhookSecret, }, }, modelProvider: { User, BalanceRecord, }, } = app_1.default;
const createTest = (params) => {
    // eslint-disable-next-line no-restricted-properties
    const { url, body, bodyBuilder, eventType = ICcBill_1.ICcBill.EventType.NewSaleSuccess, isForced, } = params;
    specHelper_1.default.checkResponse(function () {
        return specHelper_1.default.post(url || `${config_1.default.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=${clientAccnum}&clientSubacc=${clientSubacc}&eventType=${eventType}`, bodyBuilder ? bodyBuilder.call(this) : body);
    }, 200, {
        isForced,
    });
};
const createMetadata = (metadata) => Buffer
    .from(JSON.stringify(metadata), 'ascii')
    .toString('base64');
const subscriptionId = '1000000000';
const transactionId = '0912191101000000159';
const timestamp = '2012‐08‐05 15:18:17';
describe('REST /billing - Billing', () => {
    describe('POST /webhook/:secret - Receive Webhook', () => {
        describe('NewSaleSuccess', () => {
            const dynamicPricingValidationDigest = crypto_1.default
                .createHash('md5')
                .update(([subscriptionId, 1, salt].join('')))
                .digest('hex');
            describe('new subscription', () => {
                specHelper_1.default.withUserSocket({
                    key: 'userSocket',
                    userKey: 'user',
                });
                specHelper_1.default.withUserSocket({
                    key: 'targetUserSocket',
                    userKey: 'targetUser',
                });
                specHelper_1.default.withSocketHandler({
                    eventName: 'new-user-signal',
                    makeSnapShot: {
                        mask: ['data.recipients', 'data.data.targetUserId'],
                    },
                });
                specHelper_1.default.withSocketHandler({
                    eventName: 'new-user-signal',
                    key: 'targetUserSocket',
                    shouldBeSilent: true,
                });
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    bodyBuilder() {
                        return {
                            subscriptionId,
                            timestamp,
                            transactionId,
                            dynamicPricingValidationDigest,
                            flexId,
                            'X-metadata': createMetadata({
                                targetUserId: this.targetUser._id,
                                userId: this.user._id,
                            }),
                        };
                    },
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User
                            .findById(this.user._id)
                            .select('subscriptions activeSubscriptionsCounter subscriptionsCounter')
                            .lean();
                        this.userSubscriptions = user.subscriptions;
                        this.userActiveSubscriptionsCounter = user.activeSubscriptionsCounter;
                        this.userSubscriptionsCounter = user.subscriptionsCounter;
                    });
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const targetUser = yield User.findById(this.targetUser._id).select('subscribers subscribersCounter').lean();
                        this.targetUserSubscribers = targetUser.subscribers;
                        this.targetUserSubscribersCounter = targetUser.subscribersCounter;
                    });
                });
                it('should contain new subscription data', function () {
                    chai_1.expect(specHelper_1.default.maskPaths(this.userSubscriptions, ['targetUser'])).matchSnapshot(this);
                });
                it('userActiveSubscriptionsCounter should be 1', function () {
                    chai_1.expect(this.userActiveSubscriptionsCounter).to.be.equal(1);
                });
                it('userSubscriptionsCounter should be 1', function () {
                    chai_1.expect(this.userSubscriptionsCounter).to.be.equal(1);
                });
                it('should contain user in subscribers', function () {
                    chai_1.expect(this.targetUserSubscribers.length).equal(1);
                    chai_1.expect(this.targetUserSubscribers[0].toHexString()).equal(this.user._id);
                    chai_1.expect(this.targetUserSubscribersCounter).equal(1);
                });
            });
            describe('new deposit', () => {
                specHelper_1.default.withUserSocket({
                    key: 'userSocket',
                    userKey: 'user',
                });
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    bodyBuilder() {
                        return {
                            subscriptionId,
                            timestamp,
                            transactionId,
                            dynamicPricingValidationDigest,
                            flexId,
                            billedInitialPrice: '20.00',
                            'X-metadata': createMetadata({
                                isDeposit: true,
                                userId: this.user._id,
                            }),
                        };
                    },
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User
                            .findById(this.user._id)
                            .select('balance')
                            .lean();
                        this.balance = user.balance;
                    });
                });
                it('should new balancerecord to be created', function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const balanceRecord = yield BalanceRecord.findOne({
                            owner: this.user._id,
                            type: balanceRecord_1.BalanceRecordType.Deposit,
                            refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Deposit,
                            sum: 20,
                        }).lean();
                        chai_1.expect(specHelper_1.default.maskPaths(balanceRecord, ['owner', '_id', 'createdAt'])).matchSnapshot(this);
                    });
                });
                it('balance should be increased to billedInitialPrice value', function () {
                    chai_1.expect(this.balance).to.be.equal(1020);
                });
            });
            describe('another subscription', () => {
                specHelper_1.default.withUser({
                    key: 'user',
                });
                specHelper_1.default.withUser({
                    key: 'targetUser',
                });
                before(function () {
                    return User.updateOne({
                        _id: this.user._id,
                    }, {
                        $push: {
                            subscriptions: {
                                active: false,
                                billing: {
                                    subscriptionId: '888888',
                                    transactionId: '80983240932840932',
                                    purchasedTimestamp: '2015‐01‐01 13:00:00',
                                },
                                targetUser: this.targetUser._id,
                            },
                        },
                    });
                });
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    bodyBuilder() {
                        return {
                            subscriptionId,
                            timestamp,
                            transactionId,
                            dynamicPricingValidationDigest,
                            flexId,
                            'X-metadata': createMetadata({
                                targetUserId: this.targetUser._id,
                                userId: this.user._id,
                            }),
                        };
                    },
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User.findById(this.user._id).select('subscriptions subscriptionsCounter').lean();
                        this.userSubscriptions = user.subscriptions;
                        this.userSubscriptionsCounter = user.subscriptionsCounter;
                    });
                });
                it('should contain new subscription data', function () {
                    chai_1.expect(specHelper_1.default.maskPaths(this.userSubscriptions, ['targetUser'])).matchSnapshot(this);
                });
                it('userSubscriptionsCounter should be 1', function () {
                    chai_1.expect(this.userSubscriptionsCounter).to.be.equal(1);
                });
            });
            describe('with wrong digest', () => {
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    body: {
                        subscriptionId,
                        timestamp,
                        transactionId,
                        dynamicPricingValidationDigest: 'wrong',
                        flexId,
                        'X-metadata': createMetadata({
                            targetUserId: '1',
                            userId: '2',
                        }),
                    },
                });
            });
            describe('with wrong flexId', () => {
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    body: {
                        subscriptionId,
                        timestamp,
                        transactionId,
                        dynamicPricingValidationDigest,
                        flexId: 'wrong',
                        'X-metadata': createMetadata({
                            targetUserId: '1',
                            userId: '2',
                        }),
                    },
                });
            });
            describe('with no metadata', () => {
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    body: {
                        subscriptionId,
                        timestamp,
                        transactionId,
                        dynamicPricingValidationDigest,
                        flexId,
                    },
                });
            });
            describe('with wrong user id', () => {
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    body: {
                        subscriptionId,
                        timestamp,
                        transactionId,
                        dynamicPricingValidationDigest,
                        flexId,
                        'X-metadata': createMetadata({
                            targetUserId: '1',
                            userId: '2',
                        }),
                    },
                });
            });
            describe('with no targetUser', () => {
                specHelper_1.default.withUser();
                const wrongTargetUserId = '5eba41ca8db04867f35599da';
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    bodyBuilder() {
                        return {
                            subscriptionId,
                            timestamp,
                            transactionId,
                            dynamicPricingValidationDigest,
                            flexId,
                            'X-metadata': createMetadata({
                                targetUserId: wrongTargetUserId,
                                userId: this.user._id,
                            }),
                        };
                    },
                });
            });
            describe('with no user', () => {
                specHelper_1.default.withUser();
                const wrongUserId = '5eba40c96a30af65f66ead12';
                createTest({
                    eventType: EventType.NewSaleSuccess,
                    bodyBuilder() {
                        return {
                            subscriptionId,
                            timestamp,
                            transactionId,
                            dynamicPricingValidationDigest,
                            flexId,
                            'X-metadata': createMetadata({
                                targetUserId: this.user._id,
                                userId: wrongUserId,
                            }),
                        };
                    },
                });
            });
        });
        describe('NewSaleFailure', () => {
            // It's how it should be built
            // crypto
            //   .createHash('md5')
            //   .update(([denialId, 0, salt].join('')))
            //   .digest('hex');
            const dynamicPricingValidationDigest = 'not checked ATM';
            const failureCode = 'BE-140';
            const failureReason = 'Invalid Input.';
            describe('new subscription', () => {
                specHelper_1.default.withUserSocket({
                    key: 'userSocket',
                    userKey: 'user',
                });
                specHelper_1.default.withUserSocket({
                    key: 'targetUserSocket',
                    userKey: 'targetUser',
                });
                specHelper_1.default.withSocketHandler({
                    eventName: 'new-user-signal',
                    makeSnapShot: {
                        mask: ['data.recipients'],
                    },
                });
                specHelper_1.default.withSocketHandler({
                    eventName: 'new-user-signal',
                    key: 'targetUserSocket',
                    shouldBeSilent: true,
                });
                createTest({
                    eventType: EventType.NewSaleFailure,
                    bodyBuilder() {
                        return {
                            subscriptionId,
                            timestamp,
                            transactionId,
                            dynamicPricingValidationDigest,
                            flexId,
                            failureCode,
                            failureReason,
                            'X-metadata': createMetadata({
                                targetUserId: this.targetUser._id,
                                userId: this.user._id,
                            }),
                        };
                    },
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User.findById(this.user._id).select('subscriptions').lean();
                        this.userSubscriptions = user.subscriptions;
                    });
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const targetUser = yield User.findById(this.targetUser._id).select('subscribers').lean();
                        this.targetUserSubscribers = targetUser.subscribers;
                    });
                });
                it('should not add subscription data', function () {
                    chai_1.expect(this.userSubscriptions.length).equal(0);
                });
                it('should not contain user in subscribers', function () {
                    chai_1.expect(this.targetUserSubscribers.length).equal(0);
                });
            });
            describe('with wrong flexId', () => {
                createTest({
                    eventType: EventType.NewSaleFailure,
                    body: {
                        subscriptionId,
                        timestamp,
                        transactionId,
                        dynamicPricingValidationDigest,
                        flexId: 'wrong',
                        failureReason,
                        failureCode,
                        'X-metadata': createMetadata({
                            targetUserId: '1',
                            userId: '2',
                        }),
                    },
                });
            });
            describe('with no metadata', () => {
                createTest({
                    eventType: EventType.NewSaleFailure,
                    body: {
                        subscriptionId,
                        timestamp,
                        transactionId,
                        dynamicPricingValidationDigest,
                        flexId,
                        failureCode,
                        failureReason,
                    },
                });
            });
            describe('with no user', () => {
                specHelper_1.default.withUser();
                createTest({
                    eventType: EventType.NewSaleFailure,
                    bodyBuilder() {
                        return {
                            subscriptionId,
                            timestamp,
                            transactionId,
                            dynamicPricingValidationDigest,
                            flexId,
                            failureCode,
                            failureReason,
                            // @ts-ignore for testing purposes
                            'X-metadata': createMetadata({
                                targetUserId: this.user._id,
                            }),
                        };
                    },
                });
            });
        });
        const createCancellationTest = (eventType, isExisting) => {
            const cancelingTimestamp = '2012‐08‐05 15:18:17';
            const thisSubscription = {
                active: true,
                targetUser: 'TBD',
                billing: {
                    subscriptionId,
                    transactionId,
                    purchasedTimestamp: timestamp,
                },
            };
            const otherSubscription = {
                active: true,
                targetUser: '5eba41ca8db04867f3550000',
                billing: {
                    subscriptionId: '9999999999',
                    transactionId: '0000000000000000000',
                    purchasedTimestamp: timestamp,
                },
            };
            describe(isExisting ? 'existing subscription' : 'not existing subscription', () => {
                specHelper_1.default.withUserSocket({
                    key: 'userSocket',
                    userKey: 'user',
                });
                if (isExisting) {
                    specHelper_1.default.withUser({
                        key: 'targetUser',
                    });
                }
                if (isExisting) {
                    specHelper_1.default.withSocketHandler({
                        eventName: 'new-user-signal',
                        makeSnapShot: {
                            mask: ['data.recipients'],
                        },
                    });
                }
                else {
                    specHelper_1.default.withSocketHandler({
                        eventName: 'new-user-signal',
                        shouldBeSilent: true,
                    });
                }
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        let subscriptions;
                        if (isExisting) {
                            subscriptions = [
                                otherSubscription,
                                thisSubscription,
                            ];
                            thisSubscription.targetUser = this.targetUser._id;
                        }
                        else {
                            subscriptions = [
                                otherSubscription,
                            ];
                        }
                        this.activeSubscriptionsCounterBefore = subscriptions
                            .filter(({ active }) => active).length;
                        this.subscriptionsCounterBefore = subscriptions.length;
                        yield User.updateOne({ _id: this.user._id }, {
                            subscriptions,
                            activeSubscriptionsCounter: this.activeSubscriptionsCounterBefore,
                            subscriptionsCounter: this.subscriptionsCounterBefore,
                        });
                        if (isExisting) {
                            yield User.updateOne({ _id: this.targetUser._id }, {
                                $push: {
                                    subscribers: this.user._id,
                                },
                            });
                        }
                    });
                });
                createTest({
                    eventType,
                    body: {
                        subscriptionId,
                        timestamp: cancelingTimestamp,
                    },
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User
                            .findById(this.user._id)
                            .select('subscriptions activeSubscriptionsCounter subscriptionsCounter')
                            .lean();
                        this.userSubscriptions = user.subscriptions;
                        this.userActiveSubscriptionsCounter = user.activeSubscriptionsCounter;
                        this.userSubscriptionsCounter = user.subscriptionsCounter;
                    });
                });
                if (isExisting) {
                    before(function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            const targetUser = yield User.findById(this.targetUser._id).select('subscribers').lean();
                            this.targetUserSubscribers = targetUser.subscribers;
                        });
                    });
                }
                it('should not add subscription data', function () {
                    chai_1.expect(specHelper_1.default.maskPaths(this.userSubscriptions, ['targetUser'])).matchSnapshot(this);
                });
                if (isExisting) {
                    it('should not contain user in subscribers', function () {
                        chai_1.expect(this.targetUserSubscribers.length).equal(0);
                    });
                    it('userActiveSubscriptionsCounter should decrease', function () {
                        chai_1.expect(this.userActiveSubscriptionsCounter).to.be.equal(this.activeSubscriptionsCounterBefore - 1);
                    });
                    it('userSubscriptionsCounter not should decrease', function () {
                        chai_1.expect(this.userSubscriptionsCounter).to.be.equal(this.subscriptionsCounterBefore);
                    });
                }
                else {
                    it('userActiveSubscriptionsCounter should be the same', function () {
                        chai_1.expect(this.userActiveSubscriptionsCounter).to.be.equal(this.activeSubscriptionsCounterBefore);
                    });
                    it('userSubscriptionsCounter should be the same', function () {
                        chai_1.expect(this.userSubscriptionsCounter).to.be.equal(this.subscriptionsCounterBefore);
                    });
                }
            });
        };
        describe('Cancellation', () => {
            createCancellationTest(EventType.Cancellation, true);
            createCancellationTest(EventType.Cancellation, false);
        });
        describe('Expiration', () => {
            createCancellationTest(EventType.Expiration, true);
            createCancellationTest(EventType.Expiration, false);
        });
        describe('failed validation', () => {
            describe('with wrong secret', () => {
                createTest({
                    url: `${config_1.default.baseUrl}/billing/webhook/badSecret`,
                });
            });
            describe('without account data', () => {
                createTest({
                    url: `${config_1.default.baseUrl}/billing/webhook/${webhookSecret}`,
                });
            });
            describe('with wrong account', () => {
                createTest({
                    url: `${config_1.default.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=wrong&clientSubacc=${clientSubacc}&eventType=${ICcBill_1.ICcBill.EventType.NewSaleSuccess}`,
                });
            });
            describe('with wrong subaccount', () => {
                createTest({
                    url: `${config_1.default.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=${clientAccnum}&clientSubacc=wrong&eventType=${ICcBill_1.ICcBill.EventType.NewSaleSuccess}`,
                });
            });
            describe('with wrong eventType', () => {
                createTest({
                    url: `${config_1.default.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=${clientAccnum}&clientSubacc=${clientSubacc}&eventType=wrong`,
                });
            });
        });
    });
});
//# sourceMappingURL=billing.spec.js.map