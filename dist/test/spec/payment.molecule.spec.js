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
const { consts: { events }, moleculerBroker, moleculerService, modelProvider: { BalanceRecord, Goal, User, }, } = app_1.default;
describe('payment Molecule', () => {
    describe('on payment.accepted', () => {
        const checkProcessedAt = function (shouldSet) {
            it(shouldSet ? 'should set processedAt' : 'should not set processedAt', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const balanceRecord = yield BalanceRecord.findById(this.balanceRecord._id);
                    return shouldSet
                        ? chai_1.expect(balanceRecord.processedAt).to.be.not.undefined
                        : chai_1.expect(balanceRecord.processedAt).to.be.undefined;
                });
            });
        };
        describe('GoalReached', () => {
            specHelper_1.default.withUser();
            specHelper_1.default.resetUserBalance();
            specHelper_1.default.withLiveStream({
                shouldMakeOnAir: true,
            });
            specHelper_1.default.withGoal();
            before(function () {
                return Goal.updateOne({ _id: this.goal._id }, { state: goal_1.GoalState.Reached, currentAmount: 500 });
            });
            const checkUser = function () {
                it('should add 500 to balance', function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User.findById(this.user._id);
                        return chai_1.expect(user.balance).to.be.equal(500);
                    });
                });
            };
            const callEventHandler = () => {
                specHelper_1.default.withGoal();
                const commonData = {
                    type: balanceRecord_1.BalanceRecordType.GoalReached,
                    refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Goal,
                    sum: 500,
                };
                specHelper_1.default.withBalanceRecord(Object.assign({ refKey: 'goal' }, commonData));
                before(() => moleculerService.startBrokerWithServices(['payment']));
                after(() => moleculerService.stopBroker());
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('payment'), events.payment.accepted, Object.assign({ _id: this.balanceRecord._id, owner: this.balanceRecord.owner, ref: this.goal._id }, commonData));
                    });
                });
            };
            callEventHandler();
            checkUser();
            checkProcessedAt(true);
        });
        describe('Sale', () => {
            specHelper_1.default.withUser();
            specHelper_1.default.resetUserBalance();
            specHelper_1.default.withLiveStream();
            const checkUser = function () {
                it('should add 300 to balance', function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User.findById(this.user._id);
                        return chai_1.expect(user.balance).to.be.equal(300);
                    });
                });
            };
            const callEventHandler = () => {
                specHelper_1.default.withGoal();
                const commonData = {
                    type: balanceRecord_1.BalanceRecordType.Sale,
                    refModel: balanceRecordRefModel_1.BalanceRecordRefModel.LiveStream,
                    sum: 300,
                };
                specHelper_1.default.withBalanceRecord(Object.assign({ refKey: 'liveStream' }, commonData));
                before(() => moleculerService.startBrokerWithServices(['payment']));
                after(() => moleculerService.stopBroker());
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('payment'), events.payment.accepted, Object.assign({ _id: this.balanceRecord._id, owner: this.balanceRecord.owner, ref: this.liveStream._id }, commonData));
                    });
                });
            };
            callEventHandler();
            checkUser();
            checkProcessedAt(true);
        });
        describe('SendTip', () => {
            specHelper_1.default.withUser();
            specHelper_1.default.withLiveStream({
                shouldMakeOnAir: true,
            });
            specHelper_1.default.withUser({
                key: 'investorUser',
            });
            const checkGoal = function (shouldIncrease, shouldReach) {
                it(shouldIncrease ? 'should increase' : 'should not increase', function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const goal = yield Goal.findById(this.goal._id);
                        return shouldIncrease
                            ? chai_1.expect(goal.currentAmount).to.be.greaterThan(0)
                            : chai_1.expect(goal.currentAmount).to.be.equal(0);
                    });
                });
                it(shouldReach ? 'should set Reached state' : 'should not set Reached state', function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const goal = yield Goal.findById(this.goal._id);
                        return shouldReach
                            ? chai_1.expect(goal.state).to.be.equal(goal_1.GoalState.Reached)
                            : chai_1.expect(goal.state).to.be.equal(goal_1.GoalState.Active);
                    });
                });
            };
            const callEventHandler = (payload = {}) => {
                specHelper_1.default.withGoal();
                const commonData = {
                    type: balanceRecord_1.BalanceRecordType.SendTip,
                    refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Goal,
                    sum: -100,
                };
                specHelper_1.default.withBalanceRecord(Object.assign(Object.assign({ ownerKey: 'investorUser', refKey: 'goal' }, commonData), payload));
                before(() => moleculerService.startBrokerWithServices(['payment']));
                after(() => moleculerService.stopBroker());
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('payment'), events.payment.accepted, Object.assign(Object.assign({ _id: this.balanceRecord._id, owner: this.balanceRecord.owner, ref: this.goal._id }, commonData), payload));
                    });
                });
            };
            describe('target state', () => {
                describe('when enough to reach', () => {
                    specHelper_1.default.checkMoleculerEventEmit(events.payment.accepted, true, {
                        mask: ['_id', 'owner', 'ref'],
                    });
                    callEventHandler({
                        sum: -100,
                    });
                    checkGoal(true, true);
                    checkProcessedAt(true);
                });
                describe('when not enough to reach', () => {
                    callEventHandler({
                        sum: -99,
                    });
                    checkGoal(true, false);
                    checkProcessedAt(true);
                });
            });
            describe('other state', () => {
                callEventHandler({
                    type: balanceRecord_1.BalanceRecordType.LoadBalance,
                });
                checkGoal(false, false);
                checkProcessedAt(false);
            });
        });
        describe('PurchaseContent', () => {
            specHelper_1.default.withUser();
            before(function () {
                return User.updateOne({ _id: this.user._id }, { purchases: [] });
            });
            specHelper_1.default.withLiveStream();
            const checkUser = function () {
                it('should add liveStream to purchases', function () {
                    var _a, _b;
                    return __awaiter(this, void 0, void 0, function* () {
                        const user = yield User.findById(this.user._id);
                        chai_1.expect(specHelper_1.default.maskPaths(user.toObject().purchases, [
                            'balanceRecord',
                            'ref',
                        ])).matchSnapshot(this);
                        chai_1.expect((_b = (_a = user === null || user === void 0 ? void 0 : user.purchases[0]) === null || _a === void 0 ? void 0 : _a.ref) === null || _b === void 0 ? void 0 : _b.toString()).to.be.equal(this.liveStream._id);
                    });
                });
            };
            const callEventHandler = () => {
                const commonData = {
                    type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                    refModel: balanceRecordRefModel_1.BalanceRecordRefModel.LiveStream,
                    sum: 1,
                };
                specHelper_1.default.withBalanceRecord(Object.assign({ refKey: 'liveStream' }, commonData));
                before(() => moleculerService.startBrokerWithServices(['payment']));
                after(() => moleculerService.stopBroker());
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('payment'), events.payment.accepted, Object.assign({ _id: this.balanceRecord._id, owner: this.balanceRecord.owner, ref: this.liveStream._id }, commonData));
                    });
                });
            };
            specHelper_1.default.checkMoleculerEventEmit(events.payment.accepted, true, {
                mask: ['_id', 'owner', 'ref'],
            });
            callEventHandler();
            checkUser();
            checkProcessedAt(true);
        });
    });
});
//# sourceMappingURL=payment.molecule.spec.js.map