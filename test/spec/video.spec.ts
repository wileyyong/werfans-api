import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { NotificationDomain } from '../../app/domains/notification';
import { BalanceRecordType } from '../../app/domains/balanceRecord';
import { BalanceRecordRefModel } from '../../app/domains/balanceRecordRefModel';

import Context = Mocha.Context;

const { modelProvider: { Notification } } = app;

const MASKING_FIELDS = [
  '_id',
  'owner',
  'createdAt',
  'updatedAt',
];

const MASKING_FIELDS_POPULATED = [
  '_id',
  'owner._id',
  'createdAt',
  'updatedAt',
];

describe('Video', () => {
  const videoData = specHelper.getFixture(specHelper.FIXTURE_TYPES.VIDEO, 1);

  specHelper.withUser({
    key: 'user',
    seed: 1,
  });

  specHelper.withUser({
    key: 'otherUser',
    seed: 2,
  });

  specHelper.withUser({
    key: 'subscriberUser',
    seed: 3,
  });

  specHelper.withUser({
    key: 'purchasedUser',
    seed: 4,
  });

  before(function () {
    return specHelper.addUserSubscribers(this.user, this.subscriberUser);
  });

  describe('Create', () => {
    describe('own', () => {
      let notifications: NotificationDomain[];
      before(() => specHelper.removeAllNotifications());
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.user._id}/videos`,
            videoData,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        201,
        {
          mask: MASKING_FIELDS,
        },
      );
      before(async () => {
        notifications = await Notification.find().lean();
      });
      after('remove video', function () {
        return specHelper.removeVideo(this.response.body);
      });
      it('should create notification', function () {
        return specHelper.maskPaths(
          notifications,
          ['_id', 'createdAt', 'updatedAt', 'recipients[0]', 'unread[0]', 'metadata.video', 'metadata.owner'],
        ).should.matchSnapshot(this);
      });
    });

    describe('for other user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.user._id}/videos`,
            videoData,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {
          description: 'should contain error',
        },
      );
    });
  });

  describe('Get list', () => {
    describe('with owner user', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain url',
        },
      );
    });
    describe('with subscriber user', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos`,
            { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain url',
        },
      );
    });
    describe('with purchased user', () => {
      specHelper.withVideo();
      specHelper.withBalanceRecord({
        type: BalanceRecordType.PurchaseContent,
        refModel: BalanceRecordRefModel.Video,
        refKey: 'video',
      });
      specHelper.addToPurchased();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos`,
            { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain url',
        },
      );
    });
    describe('with NOT subscriber user', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos`,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should not contain url',
        },
      );
    });
  });

  describe('Get one', () => {
    describe('with owner user', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain url',
        },
      );
    });
    describe('with subscriber user', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain url',
        },
      );
    });
    describe('with purchased user', () => {
      specHelper.withVideo();
      specHelper.withBalanceRecord({
        type: BalanceRecordType.PurchaseContent,
        refModel: BalanceRecordRefModel.Video,
        refKey: 'video',
      });
      specHelper.addToPurchased();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            { headers: { Authorization: `Bearer ${this.purchasedUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should contain url',
        },
      );
    });
    describe('with NOT subscriber user', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
          description: 'should not contain url',
        },
      );
    });
  });

  describe('Update', () => {
    describe('own', () => {
      specHelper.withVideo();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            {
              price: 2020,
              url: 'http://updated-url.io',
              duration: 1000,
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
    });

    describe('for video of other user', () => {
      specHelper.withVideo();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            { price: 2021 },
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {
          description: 'should contain error',
        },
      );
    });
  });

  describe('Delete', () => {
    describe('own', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        204,
      );
    });

    describe('for video of other user', () => {
      specHelper.withVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/${this.user._id}/videos/${this.video._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {
          description: 'should contain error',
        },
      );
    });
  });
});
