import { expect } from 'chai';
import { Context } from 'mocha';

import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { UserDocument, UserDomain } from '../../app/domains/user';

const { modelProvider: { User } } = app;

describe('User Admin', () => {
  const goingToBeAdminUser: Partial<UserDomain> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.USER,
  );
  goingToBeAdminUser.admin = true;

  describe('Sign up as admin', () => {
    let userDoc: UserDocument;
    specHelper.checkResponse(
      () => specHelper.post(

        `${testConfig.baseUrl}/users`,
        { ...goingToBeAdminUser, ...specHelper.getClientAuth() },
      ),
      201,
    );

    before('fetch user', async function () {
      userDoc = await User.findOne({ _id: this.response.body._id }).lean()!;
    });

    after(function () {
      return specHelper.removeUser(this.response.body);
    });

    it('should not set admin flag', () => expect(userDoc.admin).to.be.not.true);
  });

  describe('Change admin flag', () => {
    describe('by owner (not admin)', () => {
      let userDoc: UserDocument;

      specHelper.withUser({
        data: goingToBeAdminUser,
      });

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}`,
            { admin: true },
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
      );

      before('fetch user', async function () {
        userDoc = await User.findOne({ _id: this.user._id }).lean()!;
      });

      it('should not set admin flag', () => expect(userDoc.admin).to.be.not.true);
    });

    describe('by admin', () => {
      let userDoc: UserDocument;

      specHelper.withAdminUser();
      specHelper.withUser({
        data: goingToBeAdminUser,
      });

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseAdminUrl}/users/${this.user._id}`,
            { admin: true },
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        200,
      );

      before('fetch user', async function () {
        userDoc = await User.findOne({ _id: this.user._id }).lean()!;
      });

      it('should set admin flag', () => expect(userDoc.admin).to.be.true);
    });
  });
});
