'use strict';

const chakram = require('chakram');

const testConfig = require('test/config');
const specHelper = require('test/helper/specHelper');

const { expect } = chakram;

describe('LiveStream Viewers', () => {
  const adminUser = specHelper.getDefaultAdminUser();
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
  const ownerUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);
  const liveStream = specHelper.getFixture(specHelper.FIXTURE_TYPES.LIVE_STREAM);

  before(async () => {
    await specHelper.signInUser(adminUser);
    await Promise.all(
      [user, ownerUser]
        .map((currentUser) => specHelper.createUser(currentUser, true)),
    );
    await specHelper.createLiveStream(ownerUser, liveStream);
  });

  after(async () => {
    await Promise.all(
      [user, ownerUser]
        .map((currentUser) => specHelper.removeUser(currentUser)),
    );
    await specHelper.removeLiveStream(liveStream);
  });

  describe('PutViewers', () => {
    describe('right user', () => {
      let response;

      before('send request', async () => {
        response = await chakram.put(
          `${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`,
          {},
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });
      it('should return status 201', () => expect(response).to.have.status(201));
      it('should be an array', () => expect(response.body).to.be.instanceof(Array));
      it('should contain 1 item', () => expect(response.body.length).to.be.equal(1));
      it('_id should contain the same _id', () => expect(response.body[0]).to.be.equal(user._id));
    });

    describe('wrong user', () => {
      let response;
      before('send request', async () => {
        response = await chakram.put(
          `${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/${ownerUser._id}`,
          {},
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });
      it('should return status 403', () => expect(response).to.have.status(403));
    });

    describe('unauthorized users', () => {
      let response;
      before('send request', async () => {
        response = await chakram.put(
          `${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`,
          {},
        );
      });
      it('should return status 401', () => expect(response).to.have.status(401));
    });
  });

  describe('GetViewers', () => {
    let response;
    before('send request', async () => {
      response = await chakram.get(
        `${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers`,
        {
          headers: {
            Authorization: `Bearer ${user.auth.access_token}`,
          },
        },
      );
    });
    it('should return status 200', () => expect(response).to.have.status(200));
    it('should be an array', () => expect(response.body).to.be.instanceof(Array));
    it('should contain 1 item', () => expect(response.body.length).to.be.equal(1));
    it('_id should contain the same _id', () => expect(response.body[0]).to.be.equal(user._id));
  });

  describe('RemoveViewer', () => {
    describe('right user', () => {
      let response;
      before('send request', async () => {
        response = await chakram.delete(
          `${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`,
          {},
          {
            headers: {
              Authorization: `Bearer ${user.auth.access_token}`,
            },
          },
        );
      });
      it('should return status 404', () => expect(response).to.have.status(404));
    });

    describe('wrong user', () => {
      let response;
      before('send request', async () => {
        response = await chakram.delete(
          `${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/${ownerUser._id}`,
          {},
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });
      it('should return status 404', () => expect(response).to.have.status(404));
    });

    describe('unauthorized users', () => {
      let response;
      before('send request', async () => {
        response = await chakram.delete(
          `${testConfig.baseUrl}/live-streams/${liveStream._id}/viewers/me`,
          {},
        );
      });
      it('should return status 404', () => expect(response).to.have.status(404));
    });
  });
});
