"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const feedback_1 = require("../../app/domains/feedback");
const MASKING_FIELDS = [
    '_id',
    'author',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'author._id',
    'createdAt',
    'updatedAt',
];
describe('Feedback', () => {
    specHelper_1.default.withAdminUser();
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
    const otherUserData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2);
    const suggestionFeedbackData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.FEEDBACK, 1, { type: feedback_1.FeedbackType.Suggestion });
    const supportFeedbackData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.FEEDBACK, 1, { type: feedback_1.FeedbackType.SupportRequest });
    specHelper_1.default.withUser({
        key: 'user',
        data: userData,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        data: otherUserData,
    });
    const withSuggestionFeedback = (userKey = 'user') => {
        specHelper_1.default.withFeedback({
            key: 'suggestionFeedback',
            data: suggestionFeedbackData,
            userKey,
        });
    };
    const withSupportFeedback = (userKey = 'user') => {
        specHelper_1.default.withFeedback({
            key: 'supportFeedback',
            data: supportFeedbackData,
            userKey,
        });
    };
    describe('Create', () => {
        const createTest = (requestingUserKey, targetUserKey, errorCode) => () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this[targetUserKey]._id}/feedbacks`, suggestionFeedbackData, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 201, {
                mask: errorCode ? ['url'] : MASKING_FIELDS,
                description: errorCode ? 'should contain error' : 'should contain fields',
            });
            after('remove feedback', function () {
                return specHelper_1.default.removeFeedback(this.response.body);
            });
        };
        describe('by admin', createTest('adminUser', 'user'));
        describe('by user', createTest('user', 'user'));
        describe('by unauthorized', createTest(null, 'user', 401));
    });
    describe('Get list', () => {
        const createTest = (requestingUserKey, targetUserKey, errorCode) => () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this[targetUserKey]._id}/feedbacks`, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode || 200, {
                mask: errorCode ? ['url'] : MASKING_FIELDS_POPULATED,
                description: errorCode ? 'should contain error' : 'should contain fields',
            });
        };
        withSuggestionFeedback();
        withSupportFeedback();
        describe('by user', createTest('user', 'user'));
        describe('by otherUser', createTest('otherUser', 'user', 403));
        describe('by unauthorized', createTest(null, 'user', 401));
    });
    describe('Remove', () => {
        const createTest = (requestingUserKey, targetUserKey, errorCode) => () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/${this[targetUserKey]._id}/feedbacks/${this.suggestionFeedback._id}`, {}, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode, {
                mask: ['url'],
                description: 'should contain error',
            });
        };
        withSuggestionFeedback();
        describe('by admin', createTest('adminUser', 'user', 404));
        describe('by user', createTest('user', 'user', 404));
        describe('by unauthorized', createTest(null, 'user', 404));
    });
    describe('Update', () => {
        const createTest = (requestingUserKey, targetUserKey, errorCode) => () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this[targetUserKey]._id}/feedbacks/${this.suggestionFeedback._id}`, { type: 'support' }, requestingUserKey
                    ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
                    : undefined);
            }, errorCode, {
                mask: ['url'],
                description: 'should contain error',
            });
        };
        withSuggestionFeedback();
        describe('by admin', createTest('adminUser', 'user', 404));
        describe('by user', createTest('user', 'user', 404));
        describe('by unauthorized', createTest(null, 'user', 404));
    });
});
//# sourceMappingURL=feedback.spec.js.map