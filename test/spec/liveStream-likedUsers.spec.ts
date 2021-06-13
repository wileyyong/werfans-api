import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

describe('LiveStream LikedUsers', () => {
  specHelper.withUser({
    key: 'user',
  });
  specHelper.withUser({
    key: 'ownerUser',
  });

  specHelper.withLiveStream({
    userKey: 'ownerUser',
  });

  describe('PutLikedUsers', () => {
    describe('right user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        201,
        { mask: ['_id', 'username'] },
      );
    });

    describe('wrong user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/liked-users/${this.ownerUser._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
      );
    });

    describe('unauthorized users', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`,
            {},
          );
        },
        401,
      );
    });
  });

  describe('GetLikedUsers', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/liked-users`,
          {
            headers: {
              Authorization: `Bearer ${this.user.auth.access_token}`,
            },
          },
        );
      },
      200,
      { mask: ['_id', 'username'] },
    );
  });

  describe('RemoveLikedUser', () => {
    describe('right user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`,
            {},
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        204,
      );
    });

    describe('wrong user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/liked-users/${this.ownerUser._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
      );
    });

    describe('unauthorized users', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/liked-users/me`,
            {},
          );
        },
        401,
      );
    });
  });
});
