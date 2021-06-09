import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

const MASK_FIELDS = [
  '_id',
];

describe('User stats', () => {
  specHelper.withUser({
    key: 'user',
  });
  specHelper.withAlbum({
    key: 'album1',
  });
  specHelper.withPhoto({
    key: 'photo1',
    albumKey: 'album1',
  });
  specHelper.withAlbum({
    key: 'album2',
  });
  specHelper.withPhoto({
    key: 'photo2',
    albumKey: 'album2',
  });
  specHelper.withVideo({
    key: 'video1',
  });
  specHelper.withVideo({
    key: 'video2',
  });
  specHelper.withVideo({
    key: 'video3',
  });
  specHelper.withLiveStream({
    key: 'liveStream1',
  });
  specHelper.withLiveStream({
    key: 'liveStream2',
  });
  specHelper.withLiveStream({
    key: 'liveStream3',
  });
  specHelper.withLiveStream({
    key: 'liveStream4',
  });

  specHelper.withUser({
    key: 'otherUser',
  });
  specHelper.withAlbum({
    key: 'otherAlbum1',
    userKey: 'otherUser',
  });
  specHelper.withPhoto({
    key: 'otherPhoto1',
    albumKey: 'otherAlbum1',
    userKey: 'otherUser',
  });
  specHelper.withAlbum({
    key: 'otherAlbum2',
    userKey: 'otherUser',
  });
  specHelper.withVideo({
    key: 'otherVideo1',
    userKey: 'otherUser',
  });
  specHelper.withLiveStream({
    key: 'otherLiveStream1',
    userKey: 'otherUser',
  });

  describe('by owner', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/${this.user._id}?fields=stats`,
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      200,
      { mask: MASK_FIELDS },
    );
  });

  describe('in public one', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/${this.user._id}/public?fields=stats`,
          { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
        );
      },
      200,
      { mask: MASK_FIELDS },
    );
  });

  describe('in public list', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/public?fields=stats`,
          { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
        );
      },
      200,
      { mask: MASK_FIELDS },
    );
  });
});
