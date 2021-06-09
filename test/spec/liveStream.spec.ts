import moment from 'moment';
import app from 'app';
import { expect } from 'chai';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { NotificationDomain } from '../../app/domains/notification';
import { LiveStreamState } from '../../app/domains/liveStream';
import { BalanceRecordType } from '../../app/domains/balanceRecord';
import { BalanceRecordRefModel } from '../../app/domains/balanceRecordRefModel';

import Context = Mocha.Context;

const {
  consts: {
    events,
  },
  modelProvider: { LiveStream, Notification },
} = app;

const MASKING_FIELDS = [
  '_id',
  'price',
  'owner',
  'createdAt',
  'updatedAt',
];

const MASKING_FIELDS_POPULATED = [
  '_id',
  'price',
  'owner._id',
  'createdAt',
  'updatedAt',
];

describe('LiveStream', () => {
  const liveStreamData = specHelper.getFixture(specHelper.FIXTURE_TYPES.LIVE_STREAM);

  specHelper.withUser({
    key: 'user',
    seed: 1,
  });

  specHelper.withUser({
    key: 'notSubscriberUser',
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
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/me/live-streams`,
            liveStreamData,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        201,
        {
          mask: MASKING_FIELDS,
        },
      );
      after('remove liveStream', function () {
        return specHelper.removeLiveStream(this.response.body);
      });
    });

    describe('for other user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.subscriberUser._id}/live-streams`,
            liveStreamData,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
        {
        },
      );
    });
  });

  describe('Get list', () => {
    describe('with owner user', () => {
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams`,
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
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams`,
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
      specHelper.withLiveStream();
      specHelper.withBalanceRecord({
        type: BalanceRecordType.PurchaseContent,
        refModel: BalanceRecordRefModel.LiveStream,
        refKey: 'liveStream',
      });
      specHelper.addToPurchased();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams`,
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
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams`,
            { headers: { Authorization: `Bearer ${this.notSubscriberUser.auth.access_token}` } },
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
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`,
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
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`,
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
      specHelper.withLiveStream();
      specHelper.withBalanceRecord({
        type: BalanceRecordType.PurchaseContent,
        refModel: BalanceRecordRefModel.LiveStream,
        refKey: 'liveStream',
      });
      specHelper.addToPurchased();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`,
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
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`,
            { headers: { Authorization: `Bearer ${this.notSubscriberUser.auth.access_token}` } },
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

  describe('Schedule', () => {
    const rightScheduledStartingAt = moment().add(2, 'hours').toISOString();
    const wrongScheduledStartingAt = moment().add(59, 'minutes').toISOString();
    describe('own', () => {
      let notifications: NotificationDomain[];
      specHelper.withLiveStream();
      before(() => specHelper.removeAllNotifications());
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}/schedule`,
            {
              scheduledStartingAt: rightScheduledStartingAt,
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: [...MASKING_FIELDS, 'scheduledStartingAt', 'scheduledAt'],
        },
      );
      before(async () => {
        notifications = await Notification.find().lean();
      });
      after(() => specHelper.removeAllNotifications());

      it('should create notification', function () {
        return specHelper.maskPaths(
          notifications,
          [
            '_id',
            'createdAt',
            'updatedAt',
            'recipients[0]',
            'unread[0]',
            'metadata.liveStream',
            'metadata.owner._id',
            'metadata.scheduledStartingAt',
          ],
        ).should.matchSnapshot(this);
      });
    });

    describe('wrong transition', () => {
      let notifications: NotificationDomain[];
      specHelper.withLiveStream();
      before(function () {
        return LiveStream.updateOne({ _id: this.liveStream._id }, { state: LiveStreamState.OnAir });
      });
      before(() => specHelper.removeAllNotifications());
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}/schedule`,
            {
              scheduledStartingAt: rightScheduledStartingAt,
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        400,
        {
          description: 'should fail with Invalid state transition',
        },
      );
      before(async () => {
        notifications = await Notification.find().lean();
      });
      after(() => specHelper.removeAllNotifications());

      it('should not create notification', () => expect(notifications).to.have.length(0));
    });

    describe('wrong scheduledStartingAt', () => {
      let notifications: NotificationDomain[];
      specHelper.withLiveStream();
      before(function () {
        return LiveStream.updateOne({ _id: this.liveStream._id }, { state: LiveStreamState.OnAir });
      });
      before(() => specHelper.removeAllNotifications());
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}/schedule`,
            {
              scheduledStartingAt: wrongScheduledStartingAt,
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        400,
        {
          description: 'should fail with Invalid scheduledStartingAt',
        },
      );
      before(async () => {
        notifications = await Notification.find().lean();
      });
      after(() => specHelper.removeAllNotifications());

      it('should not create notification', () => expect(notifications).to.have.length(0));
    });

    describe('for other user', () => {
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/${this.subscriberUser._id}/live-streams/${this.liveStream._id}/schedule`,
            {
              scheduledStartingAt: wrongScheduledStartingAt,
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Start', () => {
    describe('own', () => {
      let notifications: NotificationDomain[];
      specHelper.withLiveStream();
      before(() => specHelper.removeAllNotifications());
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}/start`,
            {
              url: 'http://updated-url.io',
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: [...MASKING_FIELDS, 'startedAt'],
        },
      );
      before(async () => {
        notifications = await Notification.find().lean();
      });
      after(() => specHelper.removeAllNotifications());

      it('should create notification', function () {
        return specHelper.maskPaths(
          notifications,
          [
            '_id',
            'createdAt',
            'updatedAt',
            'recipients[0]',
            'unread[0]',
            'metadata.liveStream',
            'metadata.owner._id',
          ],
        ).should.matchSnapshot(this);
      });
    });

    describe('wrong transition', () => {
      let notifications: NotificationDomain[];
      specHelper.withLiveStream();
      before(function () {
        return LiveStream.updateOne({ _id: this.liveStream._id }, { state: LiveStreamState.OnAir });
      });
      before(() => specHelper.removeAllNotifications());
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}/start`,
            {
              url: 'http://updated-url.io',
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        400,
        {
          description: 'should fail with Invalid state transition',
        },
      );
      before(async () => {
        notifications = await Notification.find().lean();
      });
      after(() => specHelper.removeAllNotifications());

      it('should not create notification', () => expect(notifications).to.have.length(0));
    });

    describe('for other user', () => {
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/${this.subscriberUser._id}/live-streams/${this.liveStream._id}/start`,
            {
              url: 'http://url.io',
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Stop', () => {
    describe('own', () => {
      specHelper.withLiveStream();
      before(function () {
        return LiveStream.updateOne({ _id: this.liveStream._id }, { state: LiveStreamState.OnAir });
      });
      specHelper.checkMoleculerEventEmit(events.liveStreams.completed, true, {
        mask: ['_id'],
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}/stop`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: [...MASKING_FIELDS, 'startedAt', 'stoppedAt'],
        },
      );
    });

    describe('wrong transition', () => {
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}/stop`,
            {
              url: 'http://updated-url.io',
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        400,
        {
          description: 'should fail with Invalid state transition',
        },
      );
    });

    describe('for other user', () => {
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/${this.subscriberUser._id}/live-streams/${this.liveStream._id}/stop`,
            {
              url: 'http://url.io',
            },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Update', () => {
    describe('own', () => {
      specHelper.withLiveStream();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}`,
            { price: 2020, url: 'http://updated-url.io' },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
    });

    describe('for other user', () => {
      specHelper.withLiveStream();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`,
            { price: 2021 },
            { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } },
          );
        },
        403,
        {
        },
      );
    });
  });

  describe('Delete', () => {
    describe('own', () => {
      specHelper.withLiveStream();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/me/live-streams/${this.liveStream._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        204,
      );
    });

    describe('for other user', () => {
      specHelper.withLiveStream();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/live-streams/${this.liveStream._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.subscriberUser.auth.access_token}` } },
          );
        },
        403,
        {
        },
      );
    });
  });
});
