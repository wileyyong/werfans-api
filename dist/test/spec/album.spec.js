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
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
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
const { modelProvider: { User, Notification }, } = app_1.default;
describe('Album', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
        key: 'user',
    });
    specHelper_1.default.withUser({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
        key: 'otherUser',
    });
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield User.updateOne({ _id: this.user._id }, { $push: { subscribers: { $each: [this.otherUser._id] } } });
        });
    });
    describe('Create', () => {
        const album = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.ALBUM);
        describe('own', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/me/albums`, album, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 201, { mask: MASKING_FIELDS });
            it('should create notification', () => __awaiter(void 0, void 0, void 0, function* () {
                const notifications = yield Notification.find().lean();
                chai_1.expect(notifications.length).not.to.be.equal(0);
            }));
            after('remove album and notifications', function () {
                return Promise.all([
                    specHelper_1.default.removeAlbum(this.response.body),
                    specHelper_1.default.removeAllNotifications(),
                ]);
            });
        });
        describe('by admin', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseAdminUrl}/users/${this.otherUser._id}/albums`, album, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 201);
            after('remove album', function () {
                return specHelper_1.default.removeAlbum(this.response.body);
            });
        });
        describe('for other user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.otherUser._id}/albums`, album, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403, { mask: [] });
        });
    });
    describe('Get list', () => {
        specHelper_1.default.withAlbum();
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/albums`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
        }, 200, { mask: MASKING_FIELDS_POPULATED });
    });
    describe('Get one', () => {
        specHelper_1.default.withAlbum();
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/albums/${this.album._id}`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
        }, 200, { mask: MASKING_FIELDS_POPULATED });
    });
    describe('Update', () => {
        describe('own', () => {
            specHelper_1.default.withAlbum();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/me/albums/${this.album._id}`, { price: 2020 }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, { mask: MASKING_FIELDS_POPULATED });
        });
        describe('by admin', () => {
            specHelper_1.default.withAlbum();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseAdminUrl}/users/${this.user._id}/albums/${this.album._id}`, { price: 2020 }, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 200, { mask: MASKING_FIELDS_POPULATED });
        });
        describe('with other user', () => {
            specHelper_1.default.withAlbum();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/albums/${this.album._id}`, { price: 2021 }, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Delete', () => {
        describe('own', () => {
            specHelper_1.default.withAlbum();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/me/albums/${this.album._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 204);
        });
        describe('by admin', () => {
            specHelper_1.default.withAlbum();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseAdminUrl}/users/${this.user._id}/albums/${this.album._id}`, {}, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 204);
        });
        describe('with other user', () => {
            specHelper_1.default.withAlbum();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/albums/${this.album._id}`, {}, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403);
        });
    });
});
//# sourceMappingURL=album.spec.js.map