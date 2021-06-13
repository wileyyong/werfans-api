import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { expect } from 'chai';
import app from 'app';
import { BalanceRecordType } from '../../app/domains/balanceRecord';
import { BalanceRecordRefModel } from '../../app/domains/balanceRecordRefModel';

import Context = Mocha.Context;

const { modelProvider: { Album, Notification } } = app;

const MASKING_FIELDS = [
  '_id',
  'owner',
  'album',
  'createdAt',
  'updatedAt',
];

const MASKING_FIELDS_POPULATED = [
  '_id',
  'owner._id',
  'album._id',
  'createdAt',
  'updatedAt',
];

describe('Photo', () => {
  const albumData = specHelper.getFixture(specHelper.FIXTURE_TYPES.ALBUM);
  const otherAlbumData = specHelper.getFixture(specHelper.FIXTURE_TYPES.ALBUM);

  const photoData = specHelper.getFixture(specHelper.FIXTURE_TYPES.PHOTO);

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

  specHelper.withAlbum({
    key: 'album',
    userKey: 'user',
    data: albumData,
  });

  specHelper.withAlbum({
    key: 'otherAlbum',
    userKey: 'otherUser',
    data: otherAlbumData,
  });

  describe('Create', () => {
    describe('own', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos`,
            photoData,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        201,
        {
          mask: MASKING_FIELDS,
        },
      );

      after(function () {
        return Promise.all([
          specHelper.removePhoto(this.response.body),
          specHelper.removeAllNotifications(),
        ]);
      });

      it('should increase the photosCounter value in album object', async function () {
        const updatedAlbum = await Album
          .findOne({ _id: this.album._id })
          .select('photosCounter')
          .lean();
        expect(updatedAlbum.photosCounter).to.equal(1);
      });

      it('should create notification', async () => {
        const notifications = await Notification.find().lean();
        expect(notifications.length).not.to.be.equal(0);
      });
    });

    describe('for album of other user', () => {
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/albums/${this.otherAlbum._id}/photos`,
            this.photo,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Get list', () => {
    describe('with owner user', () => {
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos`,
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
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos`,
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
      specHelper.withPhoto();
      specHelper.withBalanceRecord({
        type: BalanceRecordType.PurchaseContent,
        refModel: BalanceRecordRefModel.Album,
        refKey: 'album',
      });
      specHelper.addToPurchased();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos`,
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
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos`,
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
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
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
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
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
      specHelper.withPhoto();
      specHelper.withBalanceRecord({
        type: BalanceRecordType.PurchaseContent,
        refModel: BalanceRecordRefModel.Album,
        refKey: 'album',
      });
      specHelper.addToPurchased();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
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
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
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
      let countBeforeUpdate: number;

      specHelper.withPhoto();
      before(async function () {
        const albumDoc = await Album
          .findOne({ _id: this.album._id })
          .select('photosCounter')
          .lean();
        countBeforeUpdate = albumDoc.photosCounter;
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
            { price: 2020, url: 'http://updated-url.io' },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
      it('should not increase the photosCounter value in album object', async function () {
        const albumDoc = await Album
          .findOne({ _id: this.album._id })
          .select('photosCounter')
          .lean();
        expect(albumDoc!.photosCounter).to.equal(countBeforeUpdate);
      });
    });

    describe('for album of other user', () => {
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
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
      let countBeforeUpdate: number;

      specHelper.withPhoto();
      before(async function () {
        const albumDoc = await Album
          .findOne({ _id: this.album._id })
          .select('photosCounter')
          .lean();
        countBeforeUpdate = albumDoc.photosCounter;
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        204,
      );
      it('should not increase the photosCounter value in album object', async function () {
        const albumDoc = await Album
          .findOne({ _id: this.album._id })
          .select('photosCounter')
          .lean();
        expect(albumDoc!.photosCounter).to.equal(countBeforeUpdate - 1);
      });
    });
    describe('for album of other user', () => {
      specHelper.withPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/albums/${this.album._id}/photos/${this.photo._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });
});
