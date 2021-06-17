"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const sinon_1 = __importDefault(require("sinon"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const MASKING_FIELDS = [
    '_id',
    'author',
    'targetUser',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'author',
    'author._id',
    'targetUser._id',
    'createdAt',
    'updatedAt',
];
const ratingUpdateStub = sinon_1.default
    .stub()
    .resolves();
const withMockChecking = (shouldCall) => {
    before(() => {
        ratingUpdateStub.resetHistory();
    });
    if (shouldCall) {
        it('should call action', () => chai_1.expect(ratingUpdateStub.callCount).equal(1));
        it('should call with args', function () {
            return chai_1.expect(ratingUpdateStub.args.length).equal(1)
                && chai_1.expect(ratingUpdateStub.args[0][0]).to.haveOwnProperty('targetUser', this.targetUser._id);
        });
    }
    else {
        it('should not call action', () => chai_1.expect(ratingUpdateStub.callCount).equal(0));
    }
};
describe('Review', () => {
    specHelper_1.default.withStubMoleculer({
        serviceNames: ['rating'],
        stubActions: {
            'rating.update': ratingUpdateStub,
        },
    });
    specHelper_1.default.withAdminUser();
    const reviewData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.REVIEW, 1);
    specHelper_1.default.withUser({
        key: 'user',
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
    });
    specHelper_1.default.withUser({
        key: 'targetUser',
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
    });
    describe('Create', () => {
        describe('by admin', () => {
            withMockChecking(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseAdminUrl}/reviews`, Object.assign(Object.assign({}, reviewData), { author: this.user._id, targetUser: this.targetUser._id }), { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 201, {
                mask: MASKING_FIELDS,
                description: 'should contain fields',
            });
            after(function () {
                return specHelper_1.default.removeReview(this.response.body);
            });
        });
        describe('by user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews`, reviewData, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 201, {
                mask: MASKING_FIELDS,
                description: 'should contain fields',
            });
            after(function () {
                return specHelper_1.default.removeReview(this.response.body);
            });
        });
        describe('by unauthorized', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews`, reviewData);
            }, 401, {
                mask: ['url'],
                description: 'should contain error',
            });
        });
    });
    describe('Get list', () => {
        specHelper_1.default.withReview({
            data: reviewData,
        });
        describe('by user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain fields',
            });
        });
        describe('by unauthorized', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews`);
            }, 401, {
                mask: ['url'],
                description: 'should contain error',
            });
        });
    });
    describe('Update', () => {
        describe('by admin', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            withMockChecking(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseAdminUrl}/reviews/${this.review._id}`, { body: 'updated' }, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain fields',
            });
        });
        describe('by user', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`, { body: 'updated' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
                description: 'should contain fields',
            });
        });
        describe('by targetUser', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            withMockChecking(false);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`, { body: 'updated' }, { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } });
            }, 404, {
                description: 'should contain fields',
            });
        });
        describe('by unauthorized', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`, { type: 'updated' });
            }, 401, {
                description: 'should contain error',
            });
        });
    });
    describe('Remove', () => {
        describe('by admin', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            withMockChecking(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseAdminUrl}/reviews/${this.review._id}`, {}, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 204);
        });
        describe('by user', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 204);
        });
        describe('by targetUser', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`, {}, { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } });
            }, 404, {
                description: 'should contain error',
            });
        });
        describe('by unauthorized', () => {
            specHelper_1.default.withReview({
                data: reviewData,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`, {});
            }, 401, {
                description: 'should contain error',
            });
        });
    });
});
//# sourceMappingURL=review.spec.js.map