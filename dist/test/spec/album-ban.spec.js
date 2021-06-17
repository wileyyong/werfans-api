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
const strike_1 = require("../../app/domains/strike");
const { consts: { events, }, modelProvider: { Album, Strike, }, } = app_1.default;
const withBannedAlbum = (banAlbum = false) => {
    specHelper_1.default.withAlbum({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.ALBUM, 2),
        key: 'bannedAlbum',
    });
    if (banAlbum) {
        before(function () {
            return specHelper_1.default.banAlbum(this.adminUser, this.bannedAlbum);
        });
    }
};
const MASKING_FIELDS = ['_id', 'owner._id', 'createdAt', 'updatedAt'];
describe('Album Ban', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        key: 'user',
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        seed: 2,
    });
    describe('Ban album', () => {
        describe('by regular user', () => {
            withBannedAlbum();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/albums/${this.bannedAlbum._id}/ban`, {
                    banningReasonType: strike_1.StrikeType.Spam,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 403);
        });
        describe('by admin', () => {
            withBannedAlbum();
            specHelper_1.default.checkMoleculerEventEmit(events.strikes.created, true, {
                mask: ['_id', 'targetUser'],
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseAdminUrl}/albums/${this.bannedAlbum._id}/ban`, {
                    banningReasonType: strike_1.StrikeType.Spam,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 204);
            it('should set banningReasonType', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const albumDoc = yield Album.findById(this.bannedAlbum._id).lean();
                    chai_1.expect(albumDoc.banningReasonType).to.be.equal(strike_1.StrikeType.Spam);
                });
            });
            it('should create a strike', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const strike = yield Strike.findOne({ ref: this.bannedAlbum._id }).lean();
                    chai_1.expect(strike.refModel).to.be.equal(strike_1.StrikeTargetModel.Album);
                    return chai_1.expect(specHelper_1.default.maskPaths(strike, [
                        '_id',
                        'creator',
                        'targetUser',
                        'ref',
                        'createdAt',
                        'updatedAt',
                    ])).matchSnapshot(this);
                });
            });
        });
    });
    describe('Unban album', () => {
        withBannedAlbum(true);
        before(function () {
            return specHelper_1.default.unbanAlbum(this.bannedAlbum);
        });
        it('should reset banningReasonType', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const albumDoc = yield Album.findById(this.bannedAlbum._id).lean();
                return chai_1.expect(albumDoc.banningReasonType).to.be.undefined;
            });
        });
    });
    describe('Actions with bannedAlbum', () => {
        describe('get one', () => {
            describe('with not owner user', () => {
                withBannedAlbum(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.bannedAlbum._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                        },
                    });
                }, 404);
            });
            describe('with owner user', () => {
                withBannedAlbum(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.bannedAlbum._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.user.auth.access_token}`,
                        },
                    });
                }, 200);
            });
            describe('with admin user', () => {
                withBannedAlbum(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/admin/albums/${this.bannedAlbum._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                        },
                    });
                }, 200);
            });
        });
        describe('get list', () => {
            withBannedAlbum(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums`, {
                    headers: {
                        Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                    },
                });
            }, 200, {
                description: 'should not contain banned item',
                mask: ['_id', 'createdAt', 'updatedAt'],
            });
        });
    });
    describe('Actions with unbannedAlbum', () => {
        describe('get one', () => {
            withBannedAlbum(true);
            before(function () {
                return specHelper_1.default.unbanAlbum(this.bannedAlbum);
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums/${this.bannedAlbum._id}`, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 200);
        });
        describe('get list', () => {
            withBannedAlbum(true);
            before(function () {
                return specHelper_1.default.unbanAlbum(this.bannedAlbum);
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/albums`, {
                    headers: {
                        Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                    },
                });
            }, 200, {
                description: 'should contain banned item',
                mask: MASKING_FIELDS,
            });
        });
    });
});
//# sourceMappingURL=album-ban.spec.js.map