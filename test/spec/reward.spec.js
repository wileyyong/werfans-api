'use strict';

const _ = require('lodash');
const chakram = require('chakram');

const testConfig = require('test/config');
const specHelper = require('test/helper/specHelper');

const { expect } = chakram;

const MASKING_FIELDS = [
  '_id',
  'place',
  'createdAt',
  'updatedAt',
];

describe('Reward', () => {
  const adminUser = specHelper.getDefaultAdminUser();
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);

  const reward = specHelper.getFixture(specHelper.FIXTURE_TYPES.REWARD);

  before('sign in admin', () => specHelper.signInUser(adminUser));

  before('create and sign in user',
    async () => specHelper.createUser(user, true));

  after('remove user', () => specHelper.removeUser(user));

  const withReward = (userData = adminUser) => {
    before('create reward', function () {
      this.reward = _.cloneDeep(reward);
      return specHelper.createReward(userData, this.reward);
    });
    after('remove reward', function () {
      return specHelper.removeReward(this.reward);
    });
  };

  describe('Create', () => {
    describe('for admin', () => {
      let response;

      before('send request', async () => {
        response = await chakram.post(
          `${testConfig.baseUrl}/rewards`,
          reward,
          { headers: { Authorization: `Bearer ${adminUser.auth.access_token}` } },
        );
      });

      after('remove reward', () => specHelper.removeReward(response.body));

      it('should return status 201', () => expect(response).to.have.status(201));
      it('should contain fields', function () {
        return specHelper.maskPaths(
          response.body,
          MASKING_FIELDS,
        ).should.matchSnapshot(this);
      });
    });

    describe('for user', () => {
      let response;

      before('send request', async () => {
        response = await chakram.post(
          `${testConfig.baseUrl}/rewards`,
          reward,
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });

      it('should return status 403', () => expect(response).to.have.status(403));
      it('should contain error', function () {
        return response.body.should.matchSnapshot(this);
      });
    });
  });

  describe('Get list', () => {
    let response;
    withReward();
    before('send request', async () => {
      response = await chakram.get(
        `${testConfig.baseUrl}/rewards`,
        { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
      );
    });

    it('should return status 200', () => {
      expect(response).to.have.status(200);
    });
    it('should contain fields', function () {
      return specHelper.maskPaths(
        response.body,
        MASKING_FIELDS,
      ).should.matchSnapshot(this);
    });
  });

  describe('Get one', () => {
    let response;
    withReward();
    before('send request', async function () {
      response = await chakram.get(
        `${testConfig.baseUrl}/rewards/${this.reward._id}`,
        { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
      );
    });

    it('should return status 200', () => {
      expect(response).to.have.status(200);
    });
    it('should contain fields', function () {
      return specHelper.maskPaths(
        response.body,
        MASKING_FIELDS,
      ).should.matchSnapshot(this);
    });
  });

  describe('Update', () => {
    describe('for admin', () => {
      let response;

      withReward();

      before('send request', async function () {
        response = await chakram.patch(
          `${testConfig.baseUrl}/rewards/${this.reward._id}`,
          { place: 2 },
          { headers: { Authorization: `Bearer ${adminUser.auth.access_token}` } },
        );
      });

      it('should return status 200', () => expect(response).to.have.status(200));
      it('should contain fields', function () {
        return specHelper.maskPaths(
          response.body,
          MASKING_FIELDS,
        ).should.matchSnapshot(this);
      });
    });

    describe('for user', () => {
      let response;

      withReward();

      before('send request', async function () {
        response = await chakram.patch(
          `${testConfig.baseUrl}/rewards/${this.reward._id}`,
          { place: 2 },
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });

      it('should return status 403', () => expect(response).to.have.status(403));
      it('should contain error', function () {
        return response.body.should.matchSnapshot(this);
      });
    });
  });

  describe('Delete', () => {
    describe('for admin', () => {
      let response;

      withReward();
      before('send request', async function () {
        response = await chakram.delete(
          `${testConfig.baseUrl}/rewards/${this.reward._id}`,
          {},
          { headers: { Authorization: `Bearer ${adminUser.auth.access_token}` } },
        );
      });

      it('should return status 204', () => expect(response).to.have.status(204));
    });

    describe('for user', () => {
      let response;

      withReward();

      before('send request', async function () {
        response = await chakram.patch(
          `${testConfig.baseUrl}/rewards/${this.reward._id}`,
          {},
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });

      it('should return status 403', () => expect(response).to.have.status(403));
    });
  });
});
