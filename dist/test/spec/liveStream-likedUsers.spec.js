"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
describe('LiveStream LikedUsers', () => {
    specHelper_1.default.withUser({
        key: 'user',
    });
    specHelper_1.default.withUser({
        key: 'ownerUser',
    });
    specHelper_1.default.withLiveStream({
        userKey: 'ownerUser',
    });
    describe('PutLikedUsers', () => {
        describe('right user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 201, { mask: ['_id', 'username'] });
        });
        describe('wrong user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/liked-users/${this.ownerUser._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403);
        });
        describe('unauthorized users', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`, {});
            }, 401);
        });
    });
    describe('GetLikedUsers', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/liked-users`, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 200, { mask: ['_id', 'username'] });
    });
    describe('RemoveLikedUser', () => {
        describe('right user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`, {}, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 204);
        });
        describe('wrong user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/liked-users/${this.ownerUser._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403);
        });
        describe('unauthorized users', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`, {});
            }, 401);
        });
    });
});
//# sourceMappingURL=liveStream-likedUsers.spec.js.map