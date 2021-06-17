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
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const chai_1 = require("chai");
const app_1 = __importDefault(require("app"));
const balanceRecord_1 = require("../../app/domains/balanceRecord");
const balanceRecordRefModel_1 = require("../../app/domains/balanceRecordRefModel");
const { modelProvider: { Album, Notification } } = app_1.default;
const MASKING_FIELDS = [
    '_id',
    'owner',
    'album',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'owner._id',
    'album._id',
    'createdAt',
    'updatedAt',
];
describe('Photo', () => {
    const albumData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.ALBUM);
    const otherAlbumData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.ALBUM);
    const photoData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.PHOTO);
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
    specHelper_1.default.withAlbum({
        key: 'album',
        userKey: 'user',
        data: albumData,
    });
    specHelper_1.default.withAlbum({
        key: 'otherAlbum',
        userKey: 'otherUser',
        data: otherAlbumData,
    });
    describe('Create', () => {
        describe('own', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/albums/${this.album._id}/photos`, photoData, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 201, {
                mask: MASKING_FIELDS,
            });
            after(function () {
                return Promise.all([
                    specHelper_1.default.removePhoto(this.response.body),
                    specHelper_1.default.removeAllNotifications(),
                ]);
            });
            it('should increase the photosCounter value in album object', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const updatedAlbum = yield Album
                        .findOne({ _id: this.album._id })
                        .select('photosCounter')
                        .lean();
                    chai_1.expect(updatedAlbum.photosCounter).to.equal(1);
                });
            });
            it('should create notification', () => __awaiter(void 0, void 0, void 0, function* () {
                const notifications = yield Notification.find().lean();
                chai_1.expect(notifications.length).not.to.be.equal(0);
            }));
        });
        describe('for album of other user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/albums/${this.otherAlbum._id}/photos`, this.photo, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Get list', () => {
        describe('with owner user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with subscriber user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos`, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with purchased user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Album,
                refKey: 'album',
            });
            specHelper_1.default.addToPurchased();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos`, { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with NOT subscriber user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should not contain url',
            });
        });
    });
    describe('Get one', () => {
        describe('with owner user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with subscriber user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with purchased user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Album,
                refKey: 'album',
            });
            specHelper_1.default.addToPurchased();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain url',
            });
        });
        describe('with NOT subscriber user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should not contain url',
            });
        });
    });
    describe('Update', () => {
        describe('own', () => {
            let countBeforeUpdate;
            specHelper_1.default.withPhoto();
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const albumDoc = yield Album
                        .findOne({ _id: this.album._id })
                        .select('photosCounter')
                        .lean();
                    countBeforeUpdate = albumDoc.photosCounter;
                });
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, { price: 2020, url: 'http://updated-url.io' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
            it('should not increase the photosCounter value in album object', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const albumDoc = yield Album
                        .findOne({ _id: this.album._id })
                        .select('photosCounter')
                        .lean();
                    chai_1.expect(albumDoc.photosCounter).to.equal(countBeforeUpdate);
                });
            });
        });
        describe('for album of other user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, { price: 2021 }, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Delete', () => {
        describe('own', () => {
            let countBeforeUpdate;
            specHelper_1.default.withPhoto();
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const albumDoc = yield Album
                        .findOne({ _id: this.album._id })
                        .select('photosCounter')
                        .lean();
                    countBeforeUpdate = albumDoc.photosCounter;
                });
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 204);
            it('should not increase the photosCounter value in album object', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const albumDoc = yield Album
                        .findOne({ _id: this.album._id })
                        .select('photosCounter')
                        .lean();
                    chai_1.expect(albumDoc.photosCounter).to.equal(countBeforeUpdate - 1);
                });
            });
        });
        describe('for album of other user', () => {
            specHelper_1.default.withPhoto();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`, {}, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
    });
});
//# sourceMappingURL=photo.spec.js.map