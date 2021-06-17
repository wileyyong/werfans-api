"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const MASK_FIELDS = [
    '_id',
];
describe('User stats', () => {
    specHelper_1.default.withUser({
        key: 'user',
    });
    specHelper_1.default.withAlbum({
        key: 'album1',
    });
    specHelper_1.default.withPhoto({
        key: 'photo1',
        albumKey: 'album1',
    });
    specHelper_1.default.withAlbum({
        key: 'album2',
    });
    specHelper_1.default.withPhoto({
        key: 'photo2',
        albumKey: 'album2',
    });
    specHelper_1.default.withVideo({
        key: 'video1',
    });
    specHelper_1.default.withVideo({
        key: 'video2',
    });
    specHelper_1.default.withVideo({
        key: 'video3',
    });
    specHelper_1.default.withLiveStream({
        key: 'liveStream1',
    });
    specHelper_1.default.withLiveStream({
        key: 'liveStream2',
    });
    specHelper_1.default.withLiveStream({
        key: 'liveStream3',
    });
    specHelper_1.default.withLiveStream({
        key: 'liveStream4',
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
    });
    specHelper_1.default.withAlbum({
        key: 'otherAlbum1',
        userKey: 'otherUser',
    });
    specHelper_1.default.withPhoto({
        key: 'otherPhoto1',
        albumKey: 'otherAlbum1',
        userKey: 'otherUser',
    });
    specHelper_1.default.withAlbum({
        key: 'otherAlbum2',
        userKey: 'otherUser',
    });
    specHelper_1.default.withVideo({
        key: 'otherVideo1',
        userKey: 'otherUser',
    });
    specHelper_1.default.withLiveStream({
        key: 'otherLiveStream1',
        userKey: 'otherUser',
    });
    describe('by owner', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}?fields=stats`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 200, { mask: MASK_FIELDS });
    });
    describe('in public one', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/public?fields=stats`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
        }, 200, { mask: MASK_FIELDS });
    });
    describe('in public list', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/public?fields=stats`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
        }, 200, { mask: MASK_FIELDS });
    });
});
//# sourceMappingURL=user-stats.spec.js.map