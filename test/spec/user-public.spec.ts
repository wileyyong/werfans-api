import { expect } from 'chai';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { Context } from 'mocha';

describe('User Public', (): void => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
  const otherUserData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);
  Object.assign(otherUserData, {
    about: 'I am',
    birthDate: '2000-01-01',
    fullName: 'Should not be visible',
    location: [0, 0],
    publicFields: { birthDate: true },
  });

  specHelper.withUser({
    data: userData,
    key: 'user',
  });

  specHelper.withUser({
    data: otherUserData,
    key: 'otherUser',
    login: false,
  });

  describe('Get list', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/public`,
          {
            headers: {
              Authorization: `Bearer ${this.user.auth.access_token}`,
            },
          },
        );
      },
      200,
      {
        mask: [
          '_id',
          'createdAt',
          'updatedAt',
        ],
      },
    );
  });

  describe('Get otherUser\'s record', (): void => {
    const createTest = (authorized: boolean) => () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.otherUser._id}/public`,
            {
              headers: authorized ? { Authorization: `Bearer ${this.user.auth.access_token}` } : {},
            },
          );
        },
        200,
        {
          mask: [
            '_id',
            'createdAt',
            'updatedAt',
          ],
        },
      );

      it('should be the same _id', function () {
        expect(this.response.body).to.have.property('_id', this.otherUser._id);
      });
    };

    describe('Authorized', createTest(true));
    describe('Unathorized', createTest(false));
  });
});
