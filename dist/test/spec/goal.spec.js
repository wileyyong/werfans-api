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
const chai_1 = require("chai");
const app_1 = __importDefault(require("app"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const goal_1 = require("../../app/domains/goal");
const liveStream_1 = require("../../app/domains/liveStream");
const { consts: { events }, modelProvider: { Goal, LiveStream, User, Notification }, } = app_1.default;
const MASKING_FIELDS = [
    '_id',
    'liveStream',
    'owner',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'liveStream',
    'owner._id',
    'createdAt',
    'updatedAt',
];
describe('Goal', () => {
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
    const otherUserData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2);
    const goalData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.GOAL);
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        key: 'user',
        data: userData,
    });
    specHelper_1.default.withLiveStream({
        key: 'liveStream',
        userKey: 'user',
        seed: 1,
        shouldMakeOnAir: true,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        data: otherUserData,
    });
    specHelper_1.default.withLiveStream({
        key: 'otherLiveStream',
        userKey: 'otherUser',
        seed: 2,
    });
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield User.updateOne({ _id: this.user._id }, { $push: { subscribers: { $each: [this.otherUser._id] } } });
        });
    });
    describe('Create', () => {
        const createTest = (requestingUserKey, targetUserKey, errorCode) => () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/${requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals`, Object.assign(Object.assign({}, goalData), (requestingUserKey === 'adminUser' ? { owner: this[targetUserKey]._id } : {})), requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 201, !errorCode
                ? { mask: MASKING_FIELDS }
                : {});
            after('remove goal', function () {
                return specHelper_1.default.removeGoal(this.response.body);
            });
        };
        describe('by admin', createTest('adminUser', 'user'));
        describe('by user', () => {
            describe('positive case', () => {
                let notifications;
                before(() => __awaiter(void 0, void 0, void 0, function* () {
                    notifications = yield Notification.find().lean();
                }));
                createTest('user', 'user')();
                after(() => specHelper_1.default.removeAllNotifications());
                it('should create notification', () => {
                    chai_1.expect(notifications.length).not.to.be.equal(0);
                });
            });
            describe('liveStream Completed', () => {
                before(function () {
                    return LiveStream.updateOne({ _id: this.liveStream._id }, { state: liveStream_1.LiveStreamState.Completed });
                });
                after(function () {
                    return LiveStream.updateOne({ _id: this.liveStream._id }, { state: liveStream_1.LiveStreamState.OnAir });
                });
                createTest('user', 'user', 400)();
            });
            describe('already has other goal', () => {
                specHelper_1.default.withGoal();
                createTest('user', 'user', 400)();
            });
        });
        describe('by other user', createTest('otherUser', 'user', 403));
        describe('by unauthorized', createTest(null, 'user', 401));
    });
    describe('Get list', () => {
        const createTest = (requestingUserKey, errorCode) => () => {
            specHelper_1.default.withGoal();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/goals`, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 200, !errorCode
                ? { mask: MASKING_FIELDS_POPULATED }
                : {});
        };
        describe('by user', createTest('user'));
        describe('by other user', createTest('otherUser'));
        describe('by unauthorized', createTest(null, 401));
    });
    describe('Get one', () => {
        const createTest = (requestingUserKey, errorCode) => () => {
            specHelper_1.default.withGoal();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/${requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}`, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 200, !errorCode
                ? { mask: MASKING_FIELDS_POPULATED }
                : {});
        };
        describe('by admin', createTest('adminUser'));
        describe('by user', createTest('user'));
        describe('by other user', createTest('otherUser'));
        describe('by unauthorized', createTest(null, 401));
    });
    describe('Update', () => {
        const createTest = (requestingUserKey, errorCode, targetAmount) => () => {
            specHelper_1.default.withGoal();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/${requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}`, !targetAmount ? { title: 'reimbursement' } : { title: 'reimbursement', targetAmount }, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 200, !errorCode
                ? { mask: MASKING_FIELDS_POPULATED }
                : {});
        };
        describe('by admin', createTest('adminUser'));
        describe('by user', () => {
            describe('positive case', () => {
                createTest('user')();
            });
            describe('should get notification with changed targetAmount', () => {
                let notifications;
                before(() => __awaiter(void 0, void 0, void 0, function* () {
                    notifications = yield Notification.find().lean();
                }));
                createTest('user', undefined, 200)();
                after(() => specHelper_1.default.removeAllNotifications());
                it('should create notification', () => {
                    chai_1.expect(notifications.length).not.to.be.equal(0);
                });
            });
        });
        describe('by other user', createTest('otherUser', 403));
        describe('by unauthorized', createTest(null, 401));
    });
    describe('Delete', () => {
        const createTest = (requestingUserKey, errorCode) => () => {
            specHelper_1.default.withGoal();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/${requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}`, {}, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 204, !errorCode
                ? undefined
                : {});
        };
        describe('by admin', createTest('adminUser'));
        describe('by user', createTest('user'));
        describe('by other user', createTest('otherUser', 403));
        describe('by unauthorized', createTest(null, 401));
    });
    describe('Change state', () => {
        const createTest = (state, requestingUserKey, errorCode) => () => {
            specHelper_1.default.withGoal();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/${requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}/${state}`, {}, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 200, !errorCode
                ? { mask: [...MASKING_FIELDS_POPULATED, 'completedAt'] }
                : {});
        };
        describe('to cancel', () => {
            const state = 'cancel';
            describe('by admin', createTest(state, 'adminUser'));
            describe('by user', createTest(state, 'user'));
            describe('by other user', createTest(state, 'otherUser', 403));
            describe('by unauthorized', createTest(state, null, 401));
        });
        describe('to complete', () => {
            const state = 'complete';
            describe('by admin', createTest(state, 'adminUser'));
            describe('by user', createTest(state, 'user'));
            describe('by other user', createTest(state, 'otherUser', 403));
            describe('by unauthorized', createTest(state, null, 401));
        });
    });
    describe('SendTip', () => {
        const createTest = (goalExtraData, initialBalance, sum, errorCode, expectedBalance, expectedPaymentAccepted) => () => {
            const requestingUserKey = 'user';
            specHelper_1.default.resetUserBalance(initialBalance);
            specHelper_1.default.withGoal();
            before(function () {
                return Goal.updateOne({ _id: this.goal._id }, goalExtraData);
            });
            if (expectedPaymentAccepted) {
                specHelper_1.default.checkMoleculerEventEmit(events.payment.accepted, true, {
                    mask: ['_id', 'owner', 'ref'],
                });
            }
            else {
                specHelper_1.default.checkMoleculerEventEmit(events.payment.accepted, false);
            }
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/goals/${this.goal._id}/tips`, { sum }, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 200, {});
            if (expectedBalance !== undefined) {
                it(`balance should be ${expectedBalance}`, function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { balance: userBalance } = yield User.findById(this.user._id).select('balance').lean();
                        chai_1.expect(userBalance).to.be.equal(expectedBalance);
                    });
                });
            }
        };
        describe('when full sum accepted', createTest({
            currentAmount: 100,
            targetAmount: 200,
        }, 100, 100, 200, 0, true));
        describe('when sum reduced', createTest({
            currentAmount: 190,
            targetAmount: 200,
        }, 100, 100, 200, 90, true));
        describe('with sum over balance', createTest({
            currentAmount: 0,
            targetAmount: 200,
        }, 99, 100, 400, 99, false));
        describe('with already full goal', createTest({
            currentAmount: 200,
            targetAmount: 200,
        }, 100, 100, 400, 100, false));
        describe('with goal in wrong state', createTest({
            currentAmount: 100,
            targetAmount: 200,
            state: goal_1.GoalState.Expired,
        }, 100, 100, 400, 100, false));
    });
});
//# sourceMappingURL=goal.spec.js.map