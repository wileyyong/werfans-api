import chai from 'chai';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

const { expect } = chai;

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
  specHelper.withAdminUser();
  specHelper.withUser({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
    key: 'user',
  });
  specHelper.withUser({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
    key: 'otherUser',
  });
  specHelper.withLiveStream();

  describe('Create', () => {
    const createTest = (requestingUserKey: string | null, statusCode: number, targetModel = 'live-streams') => () => {
      const comment = specHelper.getFixture(specHelper.FIXTURE_TYPES.COMMENT);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/${targetModel}/${this.liveStream._id}/comments`,
            comment,
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        statusCode,
        { mask: statusCode < 400 ? MASKING_FIELDS : [] },
      );
      after('remove comment', function () {
        return specHelper.removeComment(this.response.body);
      });
    };

    describe('by admin', createTest('adminUser', 201));
    describe('by user', createTest('user', 201));
    describe('by user for unknown target model', createTest('user', 403, 'unknown-model'));
    describe('by unauthorized', createTest(null, 401));
  });

  describe('Get list', () => {
    const createTest = (requestingUserKey: string | null, statusCode: number, targetModel = 'live-streams') => () => {
      specHelper.withComment();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/${targetModel}/${this.liveStream._id}/comments`,
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        statusCode,
        { mask: statusCode < 400 ? MASKING_FIELDS_POPULATED : [] },
      );
    };
    describe('by user', createTest('user', 200));
    describe('by other user', createTest('otherUser', 200));
    describe('by unauthorized', createTest(null, 401));
  });

  describe('Update', () => {
    const createTest = (requestingUserKey: string | null, statusCode: number, targetModel = 'live-streams') => () => {
      specHelper.withComment();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/${targetModel}/${this.liveStream._id}/comments/${this.comment._id}`,
            { body: 'updatedbody' },
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        statusCode,
        { mask: statusCode < 400 ? MASKING_FIELDS_POPULATED : [] },
      );
    };

    describe('by admin', createTest('adminUser', 200));
    describe('by user', createTest('user', 200));
    describe('by user do not allow to change author', () => {
      specHelper.withComment();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/comments/${this.comment._id}`,
            { author: this.adminUser._id },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
      );
      it('author should stay the same as before request', function () {
        return expect(this.response.body.author === this.user._id);
      });
    });
    describe('by other user', createTest('otherUser', 403));
    describe('by unauthorized', createTest(null, 401));
  });

  describe('Delete', () => {
    const createTest = (requestingUserKey: string | null, statusCode: number, targetModel = 'live-streams') => () => {
      specHelper.withComment();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/${targetModel}/${this.liveStream._id}/comments/${this.comment._id}`,
            {},
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        statusCode,
        statusCode < 400
          ? undefined
          : { mask: statusCode < 400 ? MASKING_FIELDS_POPULATED : [] },
      );
    };

    describe('by admin', createTest('adminUser', 204));
    describe('by user', createTest('user', 204));
    describe('by other user', createTest('otherUser', 403));
    describe('by unauthorized', createTest(null, 401));
  });
});
