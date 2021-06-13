import { Context } from 'mocha';

import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { FeedbackResource, FeedbackType } from '../../app/domains/feedback';

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
  specHelper.withAdminUser();

  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
  const otherUserData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);

  const suggestionFeedbackData: Partial<FeedbackResource> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.FEEDBACK,
    1,
    { type: FeedbackType.Suggestion },
  );

  const supportFeedbackData = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.FEEDBACK,
    1,
    { type: FeedbackType.SupportRequest },
  );

  specHelper.withUser({
    key: 'user',
    data: userData,
  });
  specHelper.withUser({
    key: 'otherUser',
    data: otherUserData,
  });

  const withSuggestionFeedback = (userKey: string = 'user') => {
    specHelper.withFeedback({
      key: 'suggestionFeedback',
      data: suggestionFeedbackData,
      userKey,
    });
  };

  const withSupportFeedback = (userKey: string = 'user') => {
    specHelper.withFeedback({
      key: 'supportFeedback',
      data: supportFeedbackData,
      userKey,
    });
  };

  describe('Create', () => {
    const createTest = (
      requestingUserKey: string | null,
      targetUserKey: string,
      errorCode?: number,
    ) => () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this[targetUserKey]._id}/feedbacks`,
            suggestionFeedbackData,
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 201,
        {
          mask: errorCode ? ['url'] : MASKING_FIELDS,
          description: errorCode ? 'should contain error' : 'should contain fields',
        },
      );

      after('remove feedback', function () {
        return specHelper.removeFeedback(this.response.body);
      });
    };

    describe('by admin', createTest('adminUser', 'user'));
    describe('by user', createTest('user', 'user'));
    describe('by unauthorized', createTest(null, 'user', 401));
  });

  describe('Get list', () => {
    const createTest = (
      requestingUserKey: string | null,
      targetUserKey: string,
      errorCode?: number,
    ) => () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this[targetUserKey]._id}/feedbacks`,
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 200,
        {
          mask: errorCode ? ['url'] : MASKING_FIELDS_POPULATED,
          description: errorCode ? 'should contain error' : 'should contain fields',
        },
      );
    };

    withSuggestionFeedback();
    withSupportFeedback();

    describe('by user', createTest('user', 'user'));
    describe('by otherUser', createTest('otherUser', 'user', 403));
    describe('by unauthorized', createTest(null, 'user', 401));
  });

  describe('Remove', () => {
    const createTest = (
      requestingUserKey: string | null,
      targetUserKey: string,
      errorCode?: number,
    ) => () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/${this[targetUserKey]._id}/feedbacks/${this.suggestionFeedback._id}`,
            {},
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode,
        {
          mask: ['url'],
          description: 'should contain error',
        },
      );
    };

    withSuggestionFeedback();

    describe('by admin', createTest('adminUser', 'user', 404));
    describe('by user', createTest('user', 'user', 404));
    describe('by unauthorized', createTest(null, 'user', 404));
  });

  describe('Update', () => {
    const createTest = (
      requestingUserKey: string | null,
      targetUserKey: string,
      errorCode?: number,
    ) => () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this[targetUserKey]._id}/feedbacks/${this.suggestionFeedback._id}`,
            { type: 'support' },
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode,
        {
          mask: ['url'],
          description: 'should contain error',
        },
      );
    };

    withSuggestionFeedback();

    describe('by admin', createTest('adminUser', 'user', 404));
    describe('by user', createTest('user', 'user', 404));
    describe('by unauthorized', createTest(null, 'user', 404));
  });
});
