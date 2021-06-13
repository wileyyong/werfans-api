import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

const {
  modelProvider: {
    User,
  },
} = app;

describe('User Subscribers', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1, { username: 'user' });
  const otherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2, { username: 'otherUser' });
  const targetUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 3, { username: 'targetUser' });
  const aloneUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 4, { username: 'aloneUser' });
  const expiredUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 5, { username: 'expiredUser' });

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
      { $push: { subscribers: { $each: [this.user._id, this.otherUser._id] } } },
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

  describe('GetSubscribers', () => {
    describe('without filters', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/subscribers`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: ['_id'],
        },
      );
    });
    describe('with q-search', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.targetUser._id}/subscribers?q=other`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: ['_id'],
        },
      );
    });
  });
});
