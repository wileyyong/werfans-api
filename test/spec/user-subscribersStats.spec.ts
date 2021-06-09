import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

const {
  modelProvider: {
    User,
  },
} = app;

const MASK_FIELDS = [
  '_id',
];

describe('User subscribersStats', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1, { username: 'user' });
  const otherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2, { username: 'otherUser' });
  const targetUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 3, { username: 'targetUser' });
  const aloneUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 4, { username: 'aloneUser' });
  const expiredUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 5, { username: 'expiredUser' });

  Object.assign(user, {
    showSubscribersCounter: false,
  });

  specHelper.withUser({
    data: user,
    key: 'user',
  });

  specHelper.withUser({
    data: otherUser,
    key: 'otherUser',
  });

  specHelper.withUser({
    data: targetUser,
    key: 'targetUser',
  });

  specHelper.withUser({
    data: expiredUser,
    key: 'expiredUser',
  });

  specHelper.withUser({
    data: aloneUser,
    key: 'aloneUser',
  });

  before(async function (this: Context) {
    await User.updateOne(
      { _id: this.targetUser._id },
      {
        $push: {
          subscribers: {
            $each: [this.user._id, this.otherUser._id],
          },
        },
        $set: { subscribersCounter: 2 },
      },
    );
    await User.updateOne(
      { _id: this.user._id },
      {
        $push: {
          subscriptions: {
            active: true,
            targetUser: this.targetUser._id,
          },
        },
      },
    );
    await User.updateOne(
      { _id: this.otherUser._id },
      {
        $push: {
          subscriptions: {
            active: true,
            targetUser: this.targetUser._id,
          },
        },
      },
    );
    await User.updateOne(
      { _id: this.expiredUser._id },
      {
        $push: {
          subscriptions: {
            active: false,
            targetUser: this.targetUser._id,
          },
        },
      },
    );
  });

  describe('by owner', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/${this.targetUser._id}?fields=subscribersStats`,
          { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } },
        );
      },
      200,
      { mask: MASK_FIELDS },
    );
  });

  describe('in public one', () => {
    describe('with enabled showSubscribersCounter', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/public?fields=subscribersStats`,
            { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } },
          );
        },
        200,
        { mask: MASK_FIELDS },
      );
    });

    describe('with disabled showSubscribersCounter', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/public?fields=subscribersStats`,
            { headers: { Authorization: `Bearer ${this.aloneUser.auth.access_token}` } },
          );
        },
        200,
        { mask: MASK_FIELDS },
      );
    });
  });

  describe('in public list', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/public?fields=subscribersStats`,
          { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } },
        );
      },
      200,
      { mask: MASK_FIELDS },
    );
  });
});
