import app from 'app';
import { expect } from 'chai';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import Context = Mocha.Context;

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

const {
  modelProvider: { User, Notification },
} = app;

describe('Album', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
    key: 'user',
  });
  specHelper.withUser({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
    key: 'otherUser',
  });

  before(async function (this: Context) {
    await User.updateOne(
      { _id: this.user._id },
      { $push: { subscribers: { $each: [this.otherUser._id] } } },
    );
  });

  describe('Create', () => {
    const album = specHelper.getFixture(specHelper.FIXTURE_TYPES.ALBUM);

    describe('own', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/me/albums`,
            album,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        201,
        { mask: MASKING_FIELDS },
      );

      it('should create notification', async () => {
        const notifications = await Notification.find().lean();
        expect(notifications.length).not.to.be.equal(0);
      });

      after('remove album and notifications', function () {
        return Promise.all([
          specHelper.removeAlbum(this.response.body),
          specHelper.removeAllNotifications(),
        ]);
      });
    });

    describe('by admin', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseAdminUrl}/users/${this.otherUser._id}/albums`,
            album,
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        201,
      );
      after('remove album', function () {
        return specHelper.removeAlbum(this.response.body);
      });
    });

    describe('for other user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.otherUser._id}/albums`,
            album,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
        { mask: [] },
      );
    });
  });

  describe('Get list', () => {
    specHelper.withAlbum();
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/${this.user._id}/albums`,
          { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
        );
      },
      200,
      { mask: MASKING_FIELDS_POPULATED },
    );
  });

  describe('Get one', () => {
    specHelper.withAlbum();
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/${this.user._id}/albums/${this.album._id}`,
          { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
        );
      },
      200,
      { mask: MASKING_FIELDS_POPULATED },
    );
  });

  describe('Update', () => {
    describe('own', () => {
      specHelper.withAlbum();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/me/albums/${this.album._id}`,
            { price: 2020 },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        { mask: MASKING_FIELDS_POPULATED },
      );
    });

    describe('by admin', () => {
      specHelper.withAlbum();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseAdminUrl}/users/${this.user._id}/albums/${this.album._id}`,
            { price: 2020 },
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        200,
        { mask: MASKING_FIELDS_POPULATED },
      );
    });

    describe('with other user', () => {
      specHelper.withAlbum();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/albums/${this.album._id}`,
            { price: 2021 },
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Delete', () => {
    describe('own', () => {
      specHelper.withAlbum();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/me/albums/${this.album._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        204,
      );
    });

    describe('by admin', () => {
      specHelper.withAlbum();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseAdminUrl}/users/${this.user._id}/albums/${this.album._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        204,
      );
    });

    describe('with other user', () => {
      specHelper.withAlbum();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/albums/${this.album._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
      );
    });
  });
});
