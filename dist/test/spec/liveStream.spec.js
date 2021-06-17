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
const moment_1 = __importDefault(require("moment"));
const app_1 = __importDefault(require("app"));
const chai_1 = require("chai");
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const liveStream_1 = require("../../app/domains/liveStream");
const balanceRecord_1 = require("../../app/domains/balanceRecord");
const balanceRecordRefModel_1 = require("../../app/domains/balanceRecordRefModel");
const { consts: { events, }, modelProvider: { LiveStream, Notification }, } = app_1.default;
const MASKING_FIELDS = [
    '_id',
    'price',
    'owner',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'price',
    'owner._id',
    'createdAt',
    'updatedAt',
];
describe('LiveStream', () => {
    const liveStreamData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.LIVE_STREAM);
    specHelper_1.default.withUser({
        key: 'user',
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'notSubscriberUser',
        seed: 2,
    });
    specHelper_1.default.withUser({
        key: 'subscriberUser',
        seed: 3,
    });
    specHelper_1.default.withUser({
        key: 'purchasedUser',
        seed: 4,
    });
    before(function () {
        return specHelper_1.default.addUserSubscribers(this.user, this.subscriberUser);
    });
    describe('Create', () => {
        describe('own', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/me/live-streams`, liveStreamData, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 201, {
                mask: MASKING_FIELDS,
            });
            after('remove liveStream', function () {
                return specHelper_1.default.removeLiveStream(this.response.body);
            });
        });
        describe('for other user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.subscriberUser._id}/live-streams`, liveStreamData, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Get list', () => {
        describe('with owner user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with subscriber user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams`, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with purchased user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.LiveStream,
                refKey: 'liveStream',
            });
            specHelper_1.default.addToPurchased();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams`, { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with NOT subscriber user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams`, { headers: { Authorization: `Bearer ${this.notSubscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should not contain url',
            });
        });
    });
    describe('Get one', () => {
        describe('with owner user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with subscriber user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with purchased user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.LiveStream,
                refKey: 'liveStream',
            });
            specHelper_1.default.addToPurchased();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`, { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with NOT subscriber user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`, { headers: { Authorization: `Bearer ${this.notSubscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should not contain url',
            });
        });
    });
    describe('Schedule', () => {
        const rightScheduledStartingAt = moment_1.default().add(2, 'hours').toISOString();
        const wrongScheduledStartingAt = moment_1.default().add(59, 'minutes').toISOString();
        describe('own', () => {
            let notifications;
            specHelper_1.default.withLiveStream();
            before(() => specHelper_1.default.removeAllNotifications());
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}/schedule`, {
                    scheduledStartingAt: rightScheduledStartingAt,
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: [...MASKING_FIELDS, 'scheduledStartingAt', 'scheduledAt'],
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                notifications = yield Notification.find().lean();
            }));
            after(() => specHelper_1.default.removeAllNotifications());
            it('should create notification', function () {
                return specHelper_1.default.maskPaths(notifications, [
                    '_id',
                    'createdAt',
                    'updatedAt',
                    'recipients[0]',
                    'unread[0]',
                    'metadata.liveStream',
                    'metadata.owner._id',
                    'metadata.scheduledStartingAt',
                ]).should.matchSnapshot(this);
            });
        });
        describe('wrong transition', () => {
            let notifications;
            specHelper_1.default.withLiveStream();
            before(function () {
                return LiveStream.updateOne({ _id: this.liveStream._id }, { state: liveStream_1.LiveStreamState.OnAir });
            });
            before(() => specHelper_1.default.removeAllNotifications());
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}/schedule`, {
                    scheduledStartingAt: rightScheduledStartingAt,
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 400, {
                description: 'should fail with Invalid state transition',
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                notifications = yield Notification.find().lean();
            }));
            after(() => specHelper_1.default.removeAllNotifications());
            it('should not create notification', () => chai_1.expect(notifications).to.have.length(0));
        });
        describe('wrong scheduledStartingAt', () => {
            let notifications;
            specHelper_1.default.withLiveStream();
            before(function () {
                return LiveStream.updateOne({ _id: this.liveStream._id }, { state: liveStream_1.LiveStreamState.OnAir });
            });
            before(() => specHelper_1.default.removeAllNotifications());
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}/schedule`, {
                    scheduledStartingAt: wrongScheduledStartingAt,
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 400, {
                description: 'should fail with Invalid scheduledStartingAt',
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                notifications = yield Notification.find().lean();
            }));
            after(() => specHelper_1.default.removeAllNotifications());
            it('should not create notification', () => chai_1.expect(notifications).to.have.length(0));
        });
        describe('for other user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/${this.subscriberUser._id}/live-streams/${this.liveStream._id}/schedule`, {
                    scheduledStartingAt: wrongScheduledStartingAt,
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Start', () => {
        describe('own', () => {
            let notifications;
            specHelper_1.default.withLiveStream();
            before(() => specHelper_1.default.removeAllNotifications());
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}/start`, {
                    url: 'http://updated-url.io',
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: [...MASKING_FIELDS, 'startedAt'],
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                notifications = yield Notification.find().lean();
            }));
            after(() => specHelper_1.default.removeAllNotifications());
            it('should create notification', function () {
                return specHelper_1.default.maskPaths(notifications, [
                    '_id',
                    'createdAt',
                    'updatedAt',
                    'recipients[0]',
                    'unread[0]',
                    'metadata.liveStream',
                    'metadata.owner._id',
                ]).should.matchSnapshot(this);
            });
        });
        describe('wrong transition', () => {
            let notifications;
            specHelper_1.default.withLiveStream();
            before(function () {
                return LiveStream.updateOne({ _id: this.liveStream._id }, { state: liveStream_1.LiveStreamState.OnAir });
            });
            before(() => specHelper_1.default.removeAllNotifications());
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}/start`, {
                    url: 'http://updated-url.io',
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 400, {
                description: 'should fail with Invalid state transition',
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                notifications = yield Notification.find().lean();
            }));
            after(() => specHelper_1.default.removeAllNotifications());
            it('should not create notification', () => chai_1.expect(notifications).to.have.length(0));
        });
        describe('for other user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/${this.subscriberUser._id}/live-streams/${this.liveStream._id}/start`, {
                    url: 'http://url.io',
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Stop', () => {
        describe('own', () => {
            specHelper_1.default.withLiveStream();
            before(function () {
                return LiveStream.updateOne({ _id: this.liveStream._id }, { state: liveStream_1.LiveStreamState.OnAir });
            });
            specHelper_1.default.checkMoleculerEventEmit(events.liveStreams.completed, true, {
                mask: ['_id'],
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}/stop`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: [...MASKING_FIELDS, 'startedAt', 'stoppedAt'],
            });
        });
        describe('wrong transition', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}/stop`, {
                    url: 'http://updated-url.io',
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 400, {
                description: 'should fail with Invalid state transition',
            });
        });
        describe('for other user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/${this.subscriberUser._id}/live-streams/${this.liveStream._id}/stop`, {
                    url: 'http://url.io',
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Update', () => {
        describe('own', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}`, { price: 2020, url: 'http://updated-url.io' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
        });
        describe('for other user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`, { price: 2021 }, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Delete', () => {
        describe('own', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/me/live-streams/${this.liveStream._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 204);
        });
        describe('for other user', () => {
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`, {}, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 403, {});
        });
    });
});
//# sourceMappingURL=liveStream.spec.js.map