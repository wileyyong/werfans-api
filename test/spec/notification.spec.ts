import _ from 'lodash';
import { Context } from 'mocha';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { UserResource } from '../../app/domains/user';

const maskingFields = [
  '_id',
  'price',
  'owner',
  'createdAt',
  'updatedAt',
];

describe('Notification', () => {
  const notification = specHelper.getFixture(specHelper.FIXTURE_TYPES.NOTIFICATION);
  const globalNotification = specHelper.getFixture(specHelper.FIXTURE_TYPES.NOTIFICATION);

  specHelper.withAdminUser();
  specHelper.withUser({
    seed: 1,
  });
  specHelper.withUser({
    key: 'otherUser',
    seed: 2,
  });

  const withNotification = (isGlobal: boolean, recipientKeys: string[] = ['user']) => {
    before('create notification', function () {
      this.notification = _.cloneDeep(isGlobal ? globalNotification : notification);
      return specHelper.createNotification(
        this.notification,
        !isGlobal
          ? recipientKeys.map((recipientKey) => <Partial<UserResource>> this[recipientKey])
          : undefined,
      );
    });
    after(function () {
      return specHelper.removeNotification(this.notification);
    });
  };

  describe('Create', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          `${testConfig.baseUrl}/users/me/notifications`,
          notification,
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      404,
      {},
    );
  });

  describe('Get list', () => {
    describe('by owner', () => {
      withNotification(false);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/me/notifications`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: maskingFields,
        },
      );
    });
    describe('by other user', () => {
      withNotification(false);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/notifications`,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Get one', () => {
    describe('for personal', () => {
      describe('by recipient', () => {
        withNotification(false);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${testConfig.baseUrl}/users/${this.user._id}/notifications/${this.notification._id}`,
              { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
            );
          },
          200,
          {
            mask: maskingFields,
          },
        );
      });
      describe('by other user', () => {
        withNotification(false);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${testConfig.baseUrl}/users/${this.user._id}/notifications/${this.notification._id}`,
              { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
            );
          },
          403,
          {},
        );
      });
    });

    describe('for global', () => {
      withNotification(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/notifications/${this.notification._id}`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: maskingFields,
        },
      );
    });
  });

  describe('Update', () => {
    withNotification(false);
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.patch(
          `${testConfig.baseUrl}/users/me/notifications/${this.notification._id}`,
          { type: 'Testing' },
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      404,
      {
        mask: ['url'],
      },
    );
  });

  describe('Delete', () => {
    withNotification(false);
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.delete(
          `${testConfig.baseUrl}/users/me/notifications/${this.notification._id}`,
          { },
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      404,
      {
        mask: ['url'],
      },
    );
  });
});
