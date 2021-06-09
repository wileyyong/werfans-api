'use strict';

const chakram = require('chakram');

const testConfig = require('test/config');
const specHelper = require('test/helper/specHelper');

const { expect } = chakram;

describe('User Onboarding', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);

  before('create user', async () => specHelper.createUser(user, true));
  before('sign in user', async () => specHelper.signInUser(user));
  after('remove user', async () => specHelper.removeUser(user));

  describe('GetStatus', () => {
    describe('authorized users', () => {
      let response;

      before('send request', async () => {
        response = await chakram.get(
          `${testConfig.baseUrl}/users/me/onboarding`,
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });
      it('should return status 200', () => expect(response).to.have.status(200));
      it('response should contain steps', () => expect(response.body).to.have.property('steps'));
      it('response should contain steps.shouldShowPopup', () => expect(response.body.steps).to.have.property('shouldShowPopup'));
      it('response steps.shouldShowPopup should be true', () => expect(response.body.steps.shouldShowPopup).to.be.equal(true));
    });

    describe('unauthorized users', () => {
      describe('not logged in', () => {
        let response;
        before('send request', async () => {
          response = await chakram.get(
            `${testConfig.baseUrl}/users/me/onboarding`,
            {},
          );
        });
        it('should return status 401', () => expect(response).to.have.status(401));
      });
    });
  });

  describe('ShowPopup', () => {
    describe('authorized users', () => {
      let response;

      before('send request', async () => {
        response = await chakram.put(
          `${testConfig.baseUrl}/users/me/onboarding/showPopup`,
          {},
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });
      it('should return status 200', () => expect(response).to.have.status(200));
      it('response should contain message', () => expect(response.body).to.have.property('message'));
      it('response message should be success', () => expect(response.body.message).to.be.equal('success'));
    });

    describe('unauthorized users', () => {
      describe('not logged in', () => {
        let response;
        before('send request', async () => {
          response = await chakram.put(
            `${testConfig.baseUrl}/users/me/onboarding/showPopup`,
            {},
          );
        });
        it('should return status 401', () => expect(response).to.have.status(401));
      });
    });
  });
});
