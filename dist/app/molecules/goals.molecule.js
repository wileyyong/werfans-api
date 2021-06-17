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
const { consts: { events }, modelProvider: { BalanceRecord, Goal }, } = app_1.default;
exports.default = () => {
    const GoalsService = {
        name: 'goals',
        events: {
            [events.liveStreams.completed]: {
                handler(ctx) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { params: { _id: liveStreamId } } = ctx;
                        const goal = yield Goal.findOneAndUpdate({
                            liveStream: liveStreamId,
                            state: goal_1.GoalState.Active,
                        }, {
                            state: goal_1.GoalState.Expired,
                        });
                        if (goal) {
                            const balanceRecords = yield BalanceRecord
                                .find({
                                type: balanceRecord_1.BalanceRecordType.SendTip,
                                processedAt: { $exists: true },
                                ref: goal._id,
                            })
                                .lean();
                            yield Promise.all(balanceRecords.map((balanceRecord) => (app_1.default.paymentService.processRecord({
                                owner: balanceRecord.owner,
                                type: balanceRecord_1.BalanceRecordType.Reverting,
                                ref: balanceRecord._id,
                                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.BalanceRecord,
                                sum: -1 * balanceRecord.sum,
                            }))));
                        }
                    });
                },
            },
        },
    };
    return GoalsService;
};
//# sourceMappingURL=goals.molecule.js.map