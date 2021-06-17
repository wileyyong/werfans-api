import { expect } from 'chai';
import sinon from 'sinon';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { Context } from 'mocha';

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

const ratingUpdateStub = sinon
  .stub()
  .resolves();

const withMockChecking = (shouldCall: boolean) => {
  before(() => {
    ratingUpdateStub.resetHistory();
  });
  if (shouldCall) {
    it('should call action', () => expect(ratingUpdateStub.callCount).equal(1));
    it('should call with args', function () {
      return expect(ratingUpdateStub.args.length).equal(1)
        && expect(ratingUpdateStub.args[0][0]).to.haveOwnProperty('targetUser', this.targetUser._id);
    });
  } else {
    it('should not call action', () => expect(ratingUpdateStub.callCount).equal(0));
  }
};

describe('Review', () => {
  specHelper.withStubMoleculer({
    serviceNames: ['rating'],
    stubActions: {
      'rating.update': ratingUpdateStub,
    },
  });
  specHelper.withAdminUser();

  const reviewData = specHelper.getFixture(specHelper.FIXTURE_TYPES.REVIEW, 1);

  specHelper.withUser({
    key: 'user',
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
  });
  specHelper.withUser({
    key: 'targetUser',
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
  });

  describe('Create', () => {
    describe('by admin', () => {
      withMockChecking(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseAdminUrl}/reviews`,
            { ...reviewData, author: this.user._id, targetUser: this.targetUser._id },
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        201,
        {
          mask: MASKING_FIELDS,
          description: 'should contain fields',
        },
      );

      after(function () {
        return specHelper.removeReview(this.response.body);
      });
    });

    describe('by user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews`,
            reviewData,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        201,
        {
          mask: MASKING_FIELDS,
          description: 'should contain fields',
        },
      );

      after(function () {
        return specHelper.removeReview(this.response.body);
      });
    });

    describe('by unauthorized', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews`,
            reviewData,
          );
        },
        401,
        {
          mask: ['url'],
          description: 'should contain error',
        },
      );
    });
  });

  describe('Get list', () => {
    specHelper.withReview({
      data: reviewData,
    });

    describe('by user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain fields',
        },
      );
    });

    describe('by unauthorized', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews`,
          );
        },
        401,
        {
          mask: ['url'],
          description: 'should contain error',
        },
      );
    });
  });

  describe('Update', () => {
    describe('by admin', () => {
      specHelper.withReview({
        data: reviewData,
      });
      withMockChecking(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseAdminUrl}/reviews/${this.review._id}`,
            { body: 'updated' },
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain fields',
        },
      );
    });

    describe('by user', () => {
      specHelper.withReview({
        data: reviewData,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`,
            { body: 'updated' },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain fields',
        },
      );
    });

    describe('by targetUser', () => {
      specHelper.withReview({
        data: reviewData,
      });
      withMockChecking(false);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`,
            { body: 'updated' },
            { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } },
          );
        },
        404,
        {
          description: 'should contain fields',
        },
      );
    });

    describe('by unauthorized', () => {
      specHelper.withReview({
        data: reviewData,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`,
            { type: 'updated' },
          );
        },
        401,
        {
          description: 'should contain error',
        },
      );
    });
  });

  describe('Remove', () => {
    describe('by admin', () => {
      specHelper.withReview({
        data: reviewData,
      });
      withMockChecking(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseAdminUrl}/reviews/${this.review._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        204,
      );
    });

    describe('by user', () => {
      specHelper.withReview({
        data: reviewData,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        204,
      );
    });
    describe('by targetUser', () => {
      specHelper.withReview({
        data: reviewData,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } },
          );
        },
        404,
        {
          description: 'should contain error',
        },
      );
    });
    describe('by unauthorized', () => {
      specHelper.withReview({
        data: reviewData,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/reviews/${this.review._id}`,
            {},
          );
        },
        401,
        {
          description: 'should contain error',
        },
      );
    });
  });
});
