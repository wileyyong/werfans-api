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
const app_1 = __importDefault(require("app"));
const goal_1 = require("../domains/goal");
const balanceRecord_1 = require("../domains/balanceRecord");
const balanceRecordRefModel_1 = require("../domains/balanceRecordRefModel");
const { consts: { events }, modelProvider: { BalanceRecord, Goal, User }, } = app_1.default;
exports.default = () => {
    const PaymentService = {
        name: 'payment',
        events: {
            [events.payment.accepted]: {
                handler(ctx) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { params: { type } } = ctx;
                        if (type === balanceRecord_1.BalanceRecordType.SendTip) {
                            yield this.processSendTip(ctx);
                        }
                        else if (type === balanceRecord_1.BalanceRecordType.GoalReached || type === balanceRecord_1.BalanceRecordType.Sale) {
                            yield this.processGoalReachedAndSale(ctx);
                        }
                        else if (type === balanceRecord_1.BalanceRecordType.PurchaseContent) {
                            yield this.processPurchaseContent(ctx);
                        }
                    });
                },
            },
        },
        methods: {
            processGoalReachedAndSale(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { params: { _id: balanceRecordId, owner, sum } } = ctx;
                    const result = yield User.updateOne({ _id: owner }, { $inc: { balance: sum } });
                    if (result.nModified > 0) {
                        yield BalanceRecord.markProcessed(balanceRecordId);
                    }
                });
            },
            processSendTip(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { params: { _id: balanceRecordId, ref, sum } } = ctx;
                    const goal = yield Goal.findOneAndUpdate({
                        _id: ref,
                    }, {
                        $inc: { currentAmount: -1 * sum },
                    }, {
                        new: true,
                    });
                    if (!goal) {
                        this.logger.error(`Cannot find goal with _id: ${ref}. Balance record ${balanceRecordId} skipped.`);
                        return;
                    }
                    yield BalanceRecord.markProcessed(balanceRecordId);
                    if (goal.currentAmount >= goal.targetAmount) {
                        goal.state = goal_1.GoalState.Reached;
                        yield goal.save();
                        yield app_1.default.paymentService.processRecord({
                            owner: goal.owner,
                            type: balanceRecord_1.BalanceRecordType.GoalReached,
                            ref: goal._id,
                            refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Goal,
                            sum: goal.currentAmount,
                        });
                    }
                });
            },
            processPurchaseContent(ctx) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { params: { _id: balanceRecordId, owner, ref, refModel, sum } } = ctx;
                    const result = yield User.updateOne({ _id: owner }, { $push: { purchases: { balanceRecord: balanceRecordId, ref, refModel } } });
                    if (result.nModified > 0) {
                        yield BalanceRecord.markProcessed(balanceRecordId);
                        const br = yield BalanceRecord
                            .findById(balanceRecordId)
                            .select('ref refModel')
                            .populate('ref')
                            .lean();
                        yield app_1.default.paymentService.processRecord({
                            owner: (br) ? br.owner : '',
                            type: balanceRecord_1.BalanceRecordType.GoalReached,
                            ref,
                            refModel,
                            sum: -1 * sum,
                        });
                    }
                });
            },
        },
    };
    return PaymentService;
};
//# sourceMappingURL=payment.molecule.js.map