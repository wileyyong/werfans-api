import { expect } from 'chai';

import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { UserConfigResource } from '../../app/domains/userConfig';

import Context = Mocha.Context;

const MASKING_FIELDS = [
  '_id',
  'user',
  'createdAt',
  'updatedAt',
];

describe('User Config', () => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
  const otherUserData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);
  const userConfigData: Partial<UserConfigResource> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.USER_CONFIG,
    1,
  );

  specHelper.withAdminUser();
  specHelper.withUser({
    data: userData,
    key: 'user',
  });
  specHelper.withUser({
    data: otherUserData,
    key: 'otherUser',
  });

  describe('Create', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.put(
          `${testConfig.baseUrl}/users/me/configs/${userConfigData.key}`,
          userConfigData,
          {
            headers: {
              Authorization: `Bearer ${this.user.auth.access_token}`,
            },
          },
        );
      },
      201,
      {
        mask: MASKING_FIELDS,
      },
    );
    after(function () {
      return specHelper.removeUserConfig(this.response.body);
    });
    it('should have user equal to current user', function () {
      expect(this.response.body.user).to.be.equal(this.user._id);
    });
  });

  describe('Get List', () => {
    specHelper.withUserConfig({
      data: userConfigData,
    });
    describe('by owner', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/me/configs`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS,
        },
      );
    });
    describe('by admin', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/configs`,
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS,
        },
      );
    });
    describe('by otherUser', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/configs`,
            {
              headers: {
                Authorization: `Bearer ${this.otherUser.auth.access_token}`,
              },
            },
          );
        },
        403,
        {
          description: 'should return Forbidden',
        },
      );
    });
  });

  describe('Get One', () => {
    specHelper.withUserConfig({
      data: userConfigData,
    });
    describe('by owner', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/me/configs/${this.userConfig.key}`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS,
        },
      );
      it('should have user equal to user', function () {
        expect(this.response.body.user).to.be.equal(this.user._id);
      });
    });
    describe('by admin', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/configs/${this.userConfig.key}`,
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS,
        },
      );
      it('should have user equal to user', function () {
        expect(this.response.body.user).to.be.equal(this.user._id);
      });
    });
  });

  describe('Change', () => {
    const NEW_DATA = 'new-data';
    specHelper.withUserConfig({
      data: userConfigData,
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.patch(
          `${testConfig.baseUrl}/users/me/configs/${this.userConfig.key}`,
          {
            data: NEW_DATA,
          },
          {
            headers: {
              Authorization: `Bearer ${this.user.auth.access_token}`,
            },
          },
        );
      },
      200,
      {
        mask: MASKING_FIELDS,
      },
    );
  });

  describe('Remove', () => {
    specHelper.withUserConfig({
      data: userConfigData,
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.delete(
          `${testConfig.baseUrl}/users/me/configs/${this.userConfig.key}`,
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
});
