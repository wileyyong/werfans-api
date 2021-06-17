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
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const balanceRecord_1 = require("../../app/domains/balanceRecord");
const balanceRecordRefModel_1 = require("../../app/domains/balanceRecordRefModel");
const { modelProvider: { Notification } } = app_1.default;
const MASKING_FIELDS = [
    '_id',
    'owner',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'owner._id',
    'createdAt',
    'updatedAt',
];
describe('Video', () => {
    const videoData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.VIDEO, 1);
    specHelper_1.default.withUser({
        key: 'user',
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
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
            let notifications;
            before(() => specHelper_1.default.removeAllNotifications());
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.user._id}/videos`, videoData, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 201, {
                mask: MASKING_FIELDS,
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                notifications = yield Notification.find().lean();
            }));
            after('remove video', function () {
                return specHelper_1.default.removeVideo(this.response.body);
            });
            it('should create notification', function () {
                return specHelper_1.default.maskPaths(notifications, ['_id', 'createdAt', 'updatedAt', 'recipients[0]', 'unread[0]', 'metadata.video', 'metadata.owner']).should.matchSnapshot(this);
            });
        });
        describe('for other user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.user._id}/videos`, videoData, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {
                description: 'should contain error',
            });
        });
    });
    describe('Get list', () => {
        describe('with owner user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with subscriber user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos`, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with purchased user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Video,
                refKey: 'video',
            });
            specHelper_1.default.addToPurchased();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos`, { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with NOT subscriber user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should not contain url',
            });
        });
    });
    describe('Get one', () => {
        describe('with owner user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with subscriber user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with purchased user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Video,
                refKey: 'video',
            });
            specHelper_1.default.addToPurchased();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with NOT subscriber user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should not contain url',
            });
        });
    });
    describe('Update', () => {
        describe('own', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, {
                    price: 2020,
                    url: 'http://updated-url.io',
                    duration: 1000,
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
        });
        describe('for video of other user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, { price: 2021 }, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {
                description: 'should contain error',
            });
        });
    });
    describe('Delete', () => {
        describe('own', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 204);
        });
        describe('for video of other user', () => {
            specHelper_1.default.withVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/${this.user._id}/videos/${this.video._id}`, {}, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {
                description: 'should contain error',
            });
        });
    });
});
//# sourceMappingURL=video.spec.js.map