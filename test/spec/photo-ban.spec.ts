import { expect } from 'chai';
import app from 'app';
import config from 'test/config';
import specHelper from 'test/helper/specHelper';
import { StrikeTargetModel, StrikeType } from '../../app/domains/strike';

import Context = Mocha.Context;

const {
  consts: {
    events,
  },
  modelProvider: {
    Photo,
    Strike,
  },
} = app;

const withBannedPhoto = (banPhoto: boolean = false) => {
  specHelper.withPhoto({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.PHOTO, 2),
    key: 'bannedPhoto',
  });
  if (banPhoto) {
    before(function () {
      return specHelper.banPhoto(this.adminUser, this.bannedPhoto);
    });
  }
};

const MASKING_FIELDS = ['_id', 'owner._id', 'album._id', 'createdAt', 'updatedAt'];

describe('Photo Ban', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    key: 'user',
    seed: 1,
  });
  specHelper.withUser({
    key: 'otherUser',
    seed: 2,
  });

  specHelper.withAlbum({
    seed: 1,
  });

  describe('Ban photo', () => {
    describe('by regular user', () => {
      withBannedPhoto();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseUrl}/photos/${this.bannedPhoto._id}/ban`,
            {
              banningReasonType: StrikeType.Spam,
            },
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        403,
      );
    });
    describe('by admin', () => {
      withBannedPhoto();
      specHelper.checkMoleculerEventEmit(events.strikes.created, true, {
        mask: ['_id', 'targetUser'],
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseAdminUrl}/photos/${this.bannedPhoto._id}/ban`,
            {
              banningReasonType: StrikeType.Spam,
            },
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        204,
      );
      it('should set banningReasonType', async function () {
        const photoDoc = await Photo.findById(this.bannedPhoto._id).lean();
        expect(photoDoc.banningReasonType).to.be.equal(StrikeType.Spam);
      });
      it('should create a strike', async function () {
        const strike = await Strike.findOne({ ref: this.bannedPhoto._id }).lean();
        expect(strike.refModel).to.be.equal(StrikeTargetModel.Photo);
        return expect(specHelper.maskPaths(
          strike,
          [
            '_id',
            'creator',
            'targetUser',
            'ref',
            'createdAt',
            'updatedAt',
          ],
        )).matchSnapshot(this);
      });
    });
  });

  describe('Unban photo', () => {
    withBannedPhoto(true);
    before(function () {
      return specHelper.unbanPhoto(this.bannedPhoto);
    });
    it('should reset banningReasonType', async function () {
      const photoDoc = await Photo.findById(this.bannedPhoto._id).lean();
      return expect(photoDoc.banningReasonType).to.be.undefined;
    });
  });

  describe('Actions with bannedPhoto', () => {
    describe('get one', () => {
      describe('with not owner user', () => {
        withBannedPhoto(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/photos/${this.bannedPhoto._id}`,
              {
                headers: {
                  Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                },
              },
            );
          },
          404,
        );
      });
      describe('with owner user', () => {
        withBannedPhoto(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/photos/${this.bannedPhoto._id}`,
              {
                headers: {
                  Authorization: `Bearer ${this.user.auth.access_token}`,
                },
              },
            );
          },
          200,
        );
      });
      describe('with admin user', () => {
        withBannedPhoto(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/admin/photos/${this.bannedPhoto._id}`,
              {
                headers: {
                  Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                },
              },
            );
          },
          200,
        );
      });
    });
    describe('get list', () => {
      withBannedPhoto(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/photos`,
            {
              headers: {
                Authorization: `Bearer ${this.otherUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          description: 'should not contain banned item',
          mask: ['_id', 'createdAt', 'updatedAt'],
        },
      );
    });
  });

  describe('Actions with unbannedPhoto', () => {
    describe('get one', () => {
      withBannedPhoto(true);
      before(function () {
        return specHelper.unbanPhoto(this.bannedPhoto);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/photos/${this.bannedPhoto._id}`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
      );
    });
    describe('get list', () => {
      withBannedPhoto(true);
      before(function () {
        return specHelper.unbanPhoto(this.bannedPhoto);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/photos`,
            {
              headers: {
                Authorization: `Bearer ${this.otherUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          description: 'should contain banned item',
          mask: MASKING_FIELDS,
        },
      );
    });
  });
});
