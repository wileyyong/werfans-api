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
    Album,
    Strike,
  },
} = app;

const withBannedAlbum = (banAlbum: boolean = false) => {
  specHelper.withAlbum({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.ALBUM, 2),
    key: 'bannedAlbum',
  });
  if (banAlbum) {
    before(function () {
      return specHelper.banAlbum(this.adminUser, this.bannedAlbum);
    });
  }
};

const MASKING_FIELDS = ['_id', 'owner._id', 'createdAt', 'updatedAt'];

describe('Album Ban', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    key: 'user',
    seed: 1,
  });
  specHelper.withUser({
    key: 'otherUser',
    seed: 2,
  });

  describe('Ban album', () => {
    describe('by regular user', () => {
      withBannedAlbum();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseUrl}/albums/${this.bannedAlbum._id}/ban`,
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
      withBannedAlbum();
      specHelper.checkMoleculerEventEmit(events.strikes.created, true, {
        mask: ['_id', 'targetUser'],
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseAdminUrl}/albums/${this.bannedAlbum._id}/ban`,
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
        const albumDoc = await Album.findById(this.bannedAlbum._id).lean();
        expect(albumDoc.banningReasonType).to.be.equal(StrikeType.Spam);
      });
      it('should create a strike', async function () {
        const strike = await Strike.findOne({ ref: this.bannedAlbum._id }).lean();
        expect(strike.refModel).to.be.equal(StrikeTargetModel.Album);
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

  describe('Unban album', () => {
    withBannedAlbum(true);
    before(function () {
      return specHelper.unbanAlbum(this.bannedAlbum);
    });
    it('should reset banningReasonType', async function () {
      const albumDoc = await Album.findById(this.bannedAlbum._id).lean();
      return expect(albumDoc.banningReasonType).to.be.undefined;
    });
  });

  describe('Actions with bannedAlbum', () => {
    describe('get one', () => {
      describe('with not owner user', () => {
        withBannedAlbum(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/albums/${this.bannedAlbum._id}`,
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
        withBannedAlbum(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/albums/${this.bannedAlbum._id}`,
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
        withBannedAlbum(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/admin/albums/${this.bannedAlbum._id}`,
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
      withBannedAlbum(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/albums`,
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

  describe('Actions with unbannedAlbum', () => {
    describe('get one', () => {
      withBannedAlbum(true);
      before(function () {
        return specHelper.unbanAlbum(this.bannedAlbum);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/albums/${this.bannedAlbum._id}`,
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
      withBannedAlbum(true);
      before(function () {
        return specHelper.unbanAlbum(this.bannedAlbum);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/albums`,
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
