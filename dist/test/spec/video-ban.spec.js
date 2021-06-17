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
const { consts: { events, }, modelProvider: { Strike, Video, }, } = app_1.default;
const withBannedVideo = (banVideo = false) => {
    specHelper_1.default.withVideo({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.VIDEO, 2),
        key: 'bannedVideo',
    });
    if (banVideo) {
        before(function () {
            return specHelper_1.default.banVideo(this.adminUser, this.bannedVideo);
        });
    }
};
const MASKING_FIELDS = ['_id', 'owner._id', 'createdAt', 'updatedAt'];
describe('Video Ban', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        key: 'user',
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        seed: 2,
    });
    describe('Ban video', () => {
        describe('by regular user', () => {
            withBannedVideo();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/videos/${this.bannedVideo._id}/ban`, {
                    banningReasonType: strike_1.StrikeType.Spam,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 403);
        });
        describe('by admin', () => {
            withBannedVideo();
            specHelper_1.default.checkMoleculerEventEmit(events.strikes.created, true, {
                mask: ['_id', 'targetUser'],
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseAdminUrl}/videos/${this.bannedVideo._id}/ban`, {
                    banningReasonType: strike_1.StrikeType.Spam,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 204);
            it('should set banningReasonType', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const videoDoc = yield Video.findById(this.bannedVideo._id).lean();
                    chai_1.expect(videoDoc.banningReasonType).to.be.equal(strike_1.StrikeType.Spam);
                });
            });
            it('should create a strike', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const strike = yield Strike.findOne({ ref: this.bannedVideo._id }).lean();
                    chai_1.expect(strike.refModel).to.be.equal(strike_1.StrikeTargetModel.Video);
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
    describe('Unban video', () => {
        withBannedVideo(true);
        before(function () {
            return specHelper_1.default.unbanVideo(this.bannedVideo);
        });
        it('should reset banningReasonType', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const videoDoc = yield Video.findById(this.bannedVideo._id).lean();
                return chai_1.expect(videoDoc.banningReasonType).to.be.undefined;
            });
        });
    });
    describe('Actions with bannedVideo', () => {
        describe('get one', () => {
            describe('with not owner user', () => {
                withBannedVideo(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/videos/${this.bannedVideo._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                        },
                    });
                }, 404);
            });
            describe('with owner user', () => {
                withBannedVideo(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/videos/${this.bannedVideo._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.user.auth.access_token}`,
                        },
                    });
                }, 200);
            });
            describe('with admin user', () => {
                withBannedVideo(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/admin/videos/${this.bannedVideo._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                        },
                    });
                }, 200);
            });
        });
        describe('get list', () => {
            withBannedVideo(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/videos`, {
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
    describe('Actions with unbannedVideo', () => {
        describe('get one', () => {
            withBannedVideo(true);
            before(function () {
                return specHelper_1.default.unbanVideo(this.bannedVideo);
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/videos/${this.bannedVideo._id}`, {
                    headers: {
                        Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                    },
                });
            }, 200);
        });
        describe('get list', () => {
            withBannedVideo(true);
            before(function () {
                return specHelper_1.default.unbanVideo(this.bannedVideo);
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/videos`, {
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
//# sourceMappingURL=video-ban.spec.js.map