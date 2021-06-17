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
const chai_1 = require("chai");
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const goal_1 = require("../../app/domains/goal");
const balanceRecord_1 = require("../../app/domains/balanceRecord");
const balanceRecordRefModel_1 = require("../../app/domains/balanceRecordRefModel");
const { consts: { events }, moleculerBroker, moleculerService, modelProvider: { BalanceRecord, Goal, }, } = app_1.default;
describe('goals Molecule', () => {
    describe('on liveStream.completed', () => {
        specHelper_1.default.withAdminUser();
        specHelper_1.default.withUser();
        specHelper_1.default.withLiveStream({
            shouldMakeOnAir: true,
        });
        specHelper_1.default.withUser({
            key: 'investorUser',
        });
        const checkGoalState = function (shouldExpire) {
            it(shouldExpire ? 'should expire' : 'should not expire', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const goal = yield Goal.findById(this.goal._id);
                    return shouldExpire
                        ? chai_1.expect(goal.state).to.be.equal(goal_1.GoalState.Expired)
                        : chai_1.expect(goal.state).not.to.be.equal(goal_1.GoalState.Expired);
                });
            });
            if (shouldExpire) {
                it('should create reverting records', function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const balanceRecords = yield BalanceRecord.find({ _id: { $in: [this.balanceRecord1._id, this.balanceRecord2._id] } });
                        return chai_1.expect(balanceRecords.length).to.be.equal(2);
                    });
                });
            }
        };
        const callEventHandler = () => {
            specHelper_1.default.withBalanceRecord({
                key: 'balanceRecord1',
                type: balanceRecord_1.BalanceRecordType.SendTip,
                sum: -50,
                refKey: 'goal',
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Goal,
                ownerKey: 'investorUser',
            });
            specHelper_1.default.withBalanceRecord({
                key: 'balanceRecord2',
                type: balanceRecord_1.BalanceRecordType.SendTip,
                sum: -50,
                refKey: 'goal',
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Goal,
                ownerKey: 'investorUser',
            });
            before(() => moleculerService.startBrokerWithServices(['goals']));
            after(() => moleculerService.stopBroker());
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('goals'), events.liveStreams.completed, {
                        _id: this.liveStream._id,
                    });
                });
            });
        };
        describe('goal is not Active', () => {
            specHelper_1.default.withGoal();
            before('make goal Cancelled', function () {
                return Goal.updateOne({ _id: this.goal._id }, { state: goal_1.GoalState.Cancelled });
            });
            callEventHandler();
            checkGoalState(false);
        });
        describe('goal is Active', () => {
            specHelper_1.default.withGoal();
            before('make goal Active', function () {
                return Goal.updateOne({ _id: this.goal._id }, { state: goal_1.GoalState.Active });
            });
            callEventHandler();
            checkGoalState(true);
        });
    });
});
//# sourceMappingURL=goals.molecule.spec.js.map