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
    Strike,
    Video,
  },
} = app;

const withBannedVideo = (banVideo: boolean = false) => {
  specHelper.withVideo({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.VIDEO, 2),
    key: 'bannedVideo',
  });
  if (banVideo) {
    before(function () {
      return specHelper.banVideo(this.adminUser, this.bannedVideo);
    });
  }
};

const MASKING_FIELDS = ['_id', 'owner._id', 'createdAt', 'updatedAt'];

describe('Video Ban', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    key: 'user',
    seed: 1,
  });
  specHelper.withUser({
    key: 'otherUser',
    seed: 2,
  });

  describe('Ban video', () => {
    describe('by regular user', () => {
      withBannedVideo();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseUrl}/videos/${this.bannedVideo._id}/ban`,
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
      withBannedVideo();
      specHelper.checkMoleculerEventEmit(events.strikes.created, true, {
        mask: ['_id', 'targetUser'],
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseAdminUrl}/videos/${this.bannedVideo._id}/ban`,
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
        const videoDoc = await Video.findById(this.bannedVideo._id).lean();
        expect(videoDoc.banningReasonType).to.be.equal(StrikeType.Spam);
      });
      it('should create a strike', async function () {
        const strike = await Strike.findOne({ ref: this.bannedVideo._id }).lean();
        expect(strike.refModel).to.be.equal(StrikeTargetModel.Video);
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

  describe('Unban video', () => {
    withBannedVideo(true);
    before(function () {
      return specHelper.unbanVideo(this.bannedVideo);
    });
    it('should reset banningReasonType', async function () {
      const videoDoc = await Video.findById(this.bannedVideo._id).lean();
      return expect(videoDoc.banningReasonType).to.be.undefined;
    });
  });

  describe('Actions with bannedVideo', () => {
    describe('get one', () => {
      describe('with not owner user', () => {
        withBannedVideo(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/videos/${this.bannedVideo._id}`,
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
        withBannedVideo(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/videos/${this.bannedVideo._id}`,
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
        withBannedVideo(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/admin/videos/${this.bannedVideo._id}`,
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
      withBannedVideo(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/videos`,
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

  describe('Actions with unbannedVideo', () => {
    describe('get one', () => {
      withBannedVideo(true);
      before(function () {
        return specHelper.unbanVideo(this.bannedVideo);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/videos/${this.bannedVideo._id}`,
            {
              headers: {
                Authorization: `Bearer ${this.otherUser.auth.access_token}`,
              },
            },
          );
        },
        200,
      );
    });
    describe('get list', () => {
      withBannedVideo(true);
      before(function () {
        return specHelper.unbanVideo(this.bannedVideo);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/videos`,
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
