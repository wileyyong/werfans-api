import _ from 'lodash';
import { expect } from 'chai';

import app from 'app';
import config from 'test/config';
import specHelper from 'test/helper/specHelper';
import { BanningReasonType } from '../../app/domains/banning';

import Context = Mocha.Context;

const {
  modelProvider: {
    User,
  },
} = app;

const withBannedUser = (banUser: boolean = false) => {
  specHelper.withUser({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
    key: 'bannedUser',
  });
  if (banUser) {
    before(function () {
      return specHelper.banUser(this.adminUser, this.bannedUser);
    });
  }
};

const signInBannedUser = function (this: Context) {
  return specHelper.post(
    `${config.baseUrl}/oauth`,
    {
      grant_type: 'password',
      ..._.pick(this.bannedUser, 'username', 'password'),
      ...specHelper.getClientAuth(),
    },
  );
};

describe('User Ban', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
    key: 'user',
  });

  describe('Ban user', () => {
    describe('by regular user', () => {
      withBannedUser();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseUrl}/users/${this.bannedUser._id}/ban`,
            {},
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
      withBannedUser();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseAdminUrl}/users/${this.bannedUser._id}/ban`,
            {
              banningReasonDescription: 'description',
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
      it('should set banningReasonType and banningReasonDescription', async function () {
        const userDoc = await User.findById(this.bannedUser).lean();
        expect(userDoc.banningReasonType).to.be.equal(BanningReasonType.ByAdmin);
        expect(userDoc.banningReasonDescription).to.be.equal('description');
      });
    });
  });

  describe('Actions by bannedUser', () => {
    describe('sign in', () => {
      withBannedUser(true);
      before(function () {
        return specHelper.unbanUser(this.adminUser, this.bannedUser);
      });
      specHelper.checkResponse(
        signInBannedUser,
        200,
      );
    });
    describe('get own profile', () => {
      withBannedUser(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/users/me`,
            {
              headers: {
                Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
              },
            },
          );
        },
        200,
      );
    });
    describe('get strikes', () => {
      withBannedUser(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/users/me/strikes`,
            {
              headers: {
                Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
              },
            },
          );
        },
        200,
      );
    });
    describe('get other profile', () => {
      withBannedUser(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/users/${this.user._id}/public`,
            {
              headers: {
                Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
              },
            },
          );
        },
        200,
      );
    });
  });

  describe('Unban user', () => {
    describe('by regular user', () => {
      withBannedUser(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseUrl}/users/${this.bannedUser._id}/unban`,
            {},
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
      withBannedUser(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseAdminUrl}/users/${this.bannedUser._id}/unban`,
            {},
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        204,
      );
      it('should unset banningReasonType', async function () {
        const userDoc = await User.findById(this.bannedUser).lean();
        return expect(userDoc.banningReasonType).to.be.undefined;
      });
    });
  });

  describe('Actions by unbanned bannedUser', () => {
    describe('get other profile', () => {
      withBannedUser(true);
      before(function () {
        return specHelper.unbanUser(this.adminUser, this.bannedUser);
      });
      specHelper.checkResponse(
        signInBannedUser,
        200,
      );
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/users/${this.user._id}/public`,
            {
              headers: {
                Authorization: `Bearer ${this.bannedUser.auth.access_token}`,
              },
            },
          );
        },
        200,
      );
    });
  });
});
