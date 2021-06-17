'use strict';

const chakram = require('chakram');
const testConfig = require('test/config');
const specHelper = require('test/helper/specHelper');

const { expect } = chakram;
const MASKED_FIELDS = [
  '_id',
  'likedUsers',
  'favoritedUsers',
  'email',
  'username',
  'album',
  'createdAt',
  'updatedAt',
  'prices',
  'owner',
  'activeSubscriptionsCounter',
  'balance',
  'emailVerified',
  'subscribers',
  'subscriptions',
  'subscriptionsCounter',
  'viewsCounter',
];

describe('Favorite list', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const ownerUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const liveStream = specHelper.getFixture(specHelper.FIXTURE_TYPES.LIVE_STREAM);
  const album = specHelper.getFixture(specHelper.FIXTURE_TYPES.ALBUM);
  const photo = specHelper.getFixture(specHelper.FIXTURE_TYPES.PHOTO);

  const createSuite = (route) => () => {
    let entityId;

    before(async () => {
      await specHelper.createUser(user, true);
      await specHelper.createUser(ownerUser, true);
      await specHelper.createLiveStream(ownerUser, liveStream);
      await specHelper.createAlbum(ownerUser, album);
      await specHelper.createPhoto(ownerUser, album, photo);
    });

    after(async () => {
      await specHelper.removeUser(user);
      await specHelper.removeUser(ownerUser);
      await specHelper.removeLiveStream(liveStream);
      await specHelper.removeAlbum(album);
      await specHelper.removePhoto(photo);
    });

    const assignUrlParams = () => {
      switch (route) {
        case 'live-streams':
          entityId = liveStream._id;
          break;
        case 'albums':
          entityId = album._id;
          break;
        case 'photos':
          entityId = photo._id;
          break;
        case 'users':
          entityId = ownerUser._id;
          break;
        default:
          break;
      }
    };

    describe('Put to Favorites list', () => {
      const createTest = (requestingUser, targetUser, errorCode) => () => {
        let response;

        before('send request', async () => {
          assignUrlParams();

          response = await chakram.put(
            `${testConfig.baseUrl}/${route}/${entityId}/favorites/${targetUser}`,
            {},
            requestingUser
              ? { headers: { Authorization: `Bearer ${requestingUser.auth.access_token}` } }
              : undefined,
          );
        });

        if (!errorCode) {
          it('should return status 201', () => expect(response).to.have.status(201));
          it('should contain fields', function () {
            return specHelper.maskPaths(
              response.body,
              MASKED_FIELDS,
            ).should.matchSnapshot(this);
          });
        } else {
          it(`should return status ${errorCode}`, () => expect(response).to.have.status(errorCode));
          it('should contain error', function () {
            return response.body.should.matchSnapshot(this);
          });
        }
      };

      describe('by right user', createTest(user, 'me'));
      describe('by wrong user', createTest(user, ownerUser._id, 403));
      describe('by unauthorized', createTest(null, 'me', 401));
    });

    describe('Get users who added entity to Favorite list', () => {
      let response;
      before('send request', async () => {
        assignUrlParams();

        response = await chakram.get(
          `${testConfig.baseUrl}/${route}/${entityId}/favorites`,
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });
      it('should return status 200', () => expect(response).to.have.status(200));
      it('should contain array with user who has added', () => {
        expect(response.body).to.have.length(1);
        expect(response.body[0]._id).to.be.equal(user._id);
      });
    });

    describe('Verify that entity owner has appear in user\'s favorite list', () => {
      let response;
      before('send request', async () => {
        assignUrlParams();

        response = await chakram.get(
          `${testConfig.baseUrl}/users/${ownerUser._id}/favorites`,
          { headers: { Authorization: `Bearer ${user.auth.access_token}` } },
        );
      });
      it('should return status 200', () => expect(response).to.have.status(200));
      it('should contain array with user who has added', () => {
        expect(response.body).to.have.length(1);
        expect(response.body[0]._id).to.be.equal(user._id);
      });
    });

    describe('Get added to Favorite entities list', () => {
      const createTest = (requestingUser, targetUser, errorCode) => () => {
        let response;

        before('send request', async () => {
          assignUrlParams();

          response = await chakram.get(
            `${testConfig.baseUrl}/${route}/${targetUser}/favorited`,
            requestingUser
              ? { headers: { Authorization: `Bearer ${requestingUser.auth.access_token}` } }
              : undefined,
          );
        });

        if (!errorCode) {
          it('should return status 200', () => expect(response).to.have.status(200));
          it('should contain fields', function () {
            return specHelper.maskPaths(
              response.body,
              MASKED_FIELDS,
            ).should.matchSnapshot(this);
          });
        } else {
          it(`should return status ${errorCode}`, () => expect(response).to.have.status(errorCode));
          it('should contain error', function () {
            return response.body.should.matchSnapshot(this);
          });
        }
      };

      describe('for user who added to favorites', createTest(user, 'me'));
      describe('for user who didn\'t added to favorites', createTest(ownerUser, 'me'));
      describe('for unauthorized', createTest(null, user._id, 401));
    });

    describe('Remove from Favorites list', () => {
      const createTest = (requestingUser, targetUser, errorCode) => () => {
        let response;

        before('send request', async () => {
          assignUrlParams();

          response = await chakram.delete(
            `${testConfig.baseUrl}/${route}/${entityId}/favorites/${targetUser}`,
            {},
            requestingUser
              ? { headers: { Authorization: `Bearer ${requestingUser.auth.access_token}` } }
              : undefined,
          );
        });

        if (!errorCode) {
          it('should return status 204', () => expect(response).to.have.status(204));
        } else {
          it(`should return status ${errorCode}`, () => expect(response).to.have.status(errorCode));
          it('should contain error', function () {
            return response.body.should.matchSnapshot(this);
          });
        }
      };

      describe('by right user', createTest(user, 'me'));
      describe('by wrong user', createTest(user, ownerUser._id, 403));
      describe('by unauthorized', createTest(null, 'me', 401));
    });
  };

  describe('LiveStreams', createSuite('live-streams'));
  describe('Albums', createSuite('albums'));
  describe('Photos', createSuite('photos'));
  describe('Users', createSuite('users'));
});
