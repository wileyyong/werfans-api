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
const lodash_1 = __importDefault(require("lodash"));
const chai_1 = require("chai");
const app_1 = __importDefault(require("app"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const banning_1 = require("../../app/domains/banning");
const { modelProvider: { User, }, } = app_1.default;
const withBannedUser = (banUser = false) => {
    specHelper_1.default.withUser({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
        key: 'bannedUser',
    });
    if (banUser) {
        before(function () {
            return specHelper_1.default.banUser(this.adminUser, this.bannedUser);
        });
    }
};
const signInBannedUser = function () {
    return specHelper_1.default.post(`${config_1.default.baseUrl}/oauth`, Object.assign(Object.assign({ grant_type: 'password' }, lodash_1.default.pick(this.bannedUser, 'username', 'password')), specHelper_1.default.getClientAuth()));
};
describe('User Ban', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
        key: 'user',
    });
    describe('Ban user', () => {
        describe('by regular user', () => {
            withBannedUser();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.bannedUser._id}/ban`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 403);
        });
        describe('by admin', () => {
            withBannedUser();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseAdminUrl}/users/${this.bannedUser._id}/ban`, {
                    banningReasonDescription: 'description',
                }, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 204);
            it('should set banningReasonType and banningReasonDescription', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const userDoc = yield User.findById(this.bannedUser).lean();
                    chai_1.expect(userDoc.banningReasonType).to.be.equal(banning_1.BanningReasonType.ByAdmin);
                    chai_1.expect(userDoc.banningReasonDescription).to.be.equal('description');
                });
            });
        });
    });
    describe('Actions by bannedUser', () => {
        describe('sign in', () => {
            withBannedUser(true);
            before(function () {
                return specHelper_1.default.unbanUser(this.adminUser, this.bannedUser);
            });
            specHelper_1.default.checkResponse(signInBannedUser, 200);
        });
        describe('get own profile', () => {
            withBannedUser(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/me`, {
                    headers: {
                        Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
                    },
                });
            }, 200);
        });
        describe('get strikes', () => {
            withBannedUser(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/me/strikes`, {
                    headers: {
                        Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
                    },
                });
            }, 200);
        });
        describe('get other profile', () => {
            withBannedUser(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/public`, {
                    headers: {
                        Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
                    },
                });
            }, 200);
        });
    });
    describe('Unban user', () => {
        describe('by regular user', () => {
            withBannedUser(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.bannedUser._id}/unban`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 403);
        });
        describe('by admin', () => {
            withBannedUser(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseAdminUrl}/users/${this.bannedUser._id}/unban`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 204);
            it('should unset banningReasonType', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const userDoc = yield User.findById(this.bannedUser).lean();
                    return chai_1.expect(userDoc.banningReasonType).to.be.undefined;
                });
            });
        });
    });
    describe('Actions by unbanned bannedUser', () => {
        describe('get other profile', () => {
            withBannedUser(true);
            before(function () {
                return specHelper_1.default.unbanUser(this.adminUser, this.bannedUser);
            });
            specHelper_1.default.checkResponse(signInBannedUser, 200);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/public`, {
                    headers: {
                        Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
                    },
                });
            }, 200);
        });
    });
});
//# sourceMappingURL=user-ban.spec.js.map