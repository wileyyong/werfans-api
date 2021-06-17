"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = __importDefault(require("chai"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { expect } = chai_1.default;
const MASKING_FIELDS = [
    '_id',
    'author',
    'target',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'author',
    'author._id',
    'target',
    'createdAt',
    'updatedAt',
];
describe('Comment', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
        key: 'user',
    });
    specHelper_1.default.withUser({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
        key: 'otherUser',
    });
    specHelper_1.default.withLiveStream();
    describe('Create', () => {
        const createTest = (requestingUserKey, statusCode, targetModel = 'live-streams') => () => {
            const comment = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.COMMENT);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/${targetModel}/${this.liveStream._id}/comments`, comment, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, statusCode, { mask: statusCode < 400 ? MASKING_FIELDS : [] });
            after('remove comment', function () {
                return specHelper_1.default.removeComment(this.response.body);
            });
        };
        describe('by admin', createTest('adminUser', 201));
        describe('by user', createTest('user', 201));
        describe('by user for unknown target model', createTest('user', 403, 'unknown-model'));
        describe('by unauthorized', createTest(null, 401));
    });
    describe('Get list', () => {
        const createTest = (requestingUserKey, statusCode, targetModel = 'live-streams') => () => {
            specHelper_1.default.withComment();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/${targetModel}/${this.liveStream._id}/comments`, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, statusCode, { mask: statusCode < 400 ? MASKING_FIELDS_POPULATED : [] });
        };
        describe('by user', createTest('user', 200));
        describe('by other user', createTest('otherUser', 200));
        describe('by unauthorized', createTest(null, 401));
    });
    describe('Update', () => {
        const createTest = (requestingUserKey, statusCode, targetModel = 'live-streams') => () => {
            specHelper_1.default.withComment();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/${targetModel}/${this.liveStream._id}/comments/${this.comment._id}`, { body: 'updatedbody' }, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, statusCode, { mask: statusCode < 400 ? MASKING_FIELDS_POPULATED : [] });
        };
        describe('by admin', createTest('adminUser', 200));
        describe('by user', createTest('user', 200));
        describe('by user do not allow to change author', () => {
            specHelper_1.default.withComment();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/live-streams/${this.liveStream._id}/comments/${this.comment._id}`, { author: this.adminUser._id }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200);
            it('author should stay the same as before request', function () {
                return expect(this.response.body.author === this.user._id);
            });
        });
        describe('by other user', createTest('otherUser', 403));
        describe('by unauthorized', createTest(null, 401));
    });
    describe('Delete', () => {
        const createTest = (requestingUserKey, statusCode, targetModel = 'live-streams') => () => {
            specHelper_1.default.withComment();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/${targetModel}/${this.liveStream._id}/comments/${this.comment._id}`, {}, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, statusCode, statusCode < 400
                ? undefined
                : { mask: statusCode < 400 ? MASKING_FIELDS_POPULATED : [] });
        };
        describe('by admin', createTest('adminUser', 204));
        describe('by user', createTest('user', 204));
        describe('by other user', createTest('otherUser', 403));
        describe('by unauthorized', createTest(null, 401));
    });
});
//# sourceMappingURL=comment.spec.js.map