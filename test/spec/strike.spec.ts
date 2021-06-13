import { Context } from 'mocha';
import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { StrikeResource, StrikeState, StrikeTargetModel, StrikeType } from '../../app/domains/strike';

const {
  consts: {
    events,
  },
  modelProvider: {
    Strike,
  },
} = app;

const MASKING_FIELDS = [
  '_id',
  'creator',
  'targetUser',
  'type',
  'ref',
  'refModel',
  'createdAt',
  'updatedAt',
];

const MASKING_FIELDS_POPULATED = [
  '_id',
  'creator._id',
  'targetUser._id',
  'type._id',
  'ref',
  'refModel',
  'createdAt',
  'updatedAt',
];

describe('Strike', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    key: 'user',
    seed: 1,
  });
  specHelper.withUser({
    key: 'otherUser',
    seed: 2,
  });

  describe('Create', () => {
    const strikeData: Partial<StrikeResource> = specHelper.getFixture(
      specHelper.FIXTURE_TYPES.STRIKE,
    );
    before(function () {
      strikeData.targetUser = this.user._id;
    });
    describe('for admin', () => {
      specHelper.checkMoleculerEventEmit(events.strikes.created, true, {
        mask: ['_id', 'targetUser'],
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/admin/users/${this.user._id}/strikes`,
            strikeData,
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        201,
        {
          mask: MASKING_FIELDS,
        },
      );
      after('remove strike', function () {
        return specHelper.removeStrike(this.response.body);
      });
    });
    describe('for user', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.user._id}/strikes`,
            strikeData,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
    describe('for unauthorized', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/${this.user._id}/strikes`,
            strikeData,
          );
        },
        401,
        {},
      );
    });
  });

  describe('Get list', () => {
    specHelper.withStrike();
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.get(
          `${testConfig.baseUrl}/users/${this.user._id}/strikes`,
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      200,
      {
        mask: MASKING_FIELDS_POPULATED,
      },
    );
  });

  describe('Get one', () => {
    describe('for user', async () => {
      specHelper.withStrike();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/strikes/${this.strike._id}`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
    });

    describe('for unauthorized', () => {
      specHelper.withStrike();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/strikes`,
          );
        },
        401,
      );
    });
  });

  describe('Update', () => {
    describe('for admin', () => {
      specHelper.withStrike();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/admin/strikes/${this.strike._id}`,
            { type: StrikeType.Nudity },
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
    });

    describe('for user', () => {
      specHelper.withStrike();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`,
            { type: StrikeType.Nudity },
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });

    describe('for unauthorized', () => {
      specHelper.withStrike();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`,
            { type: StrikeType.Nudity },
          );
        },
        401,
      );
    });
  });

  describe('Delete', () => {
    describe('for admin', () => {
      specHelper.withStrike();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/admin/strikes/${this.strike._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
          );
        },
        204,
      );
    });

    describe('for user', () => {
      specHelper.withStrike();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`,
            {},
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
      );
    });

    describe('for unauthorized', () => {
      specHelper.withStrike();

      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`,
            {},
          );
        },
        401,
      );
    });
  });

  describe('Change state', () => {
    const createTest = (
      newState: string,
      currentState?: StrikeState,
      shouldFail?: boolean,
      shouldExpectEvent?: boolean,
    ) => {
      describe('for admin', () => {
        if (shouldExpectEvent) {
          specHelper.checkMoleculerEventEmit(events.strikes.revoked, true, {
            mask: ['_id', 'targetUser', 'ref'],
          });
        } else {
          specHelper.checkMoleculerEventEmit(events.strikes.revoked, false);
        }
        specHelper.withAlbum();
        specHelper.withStrike({
          refKey: 'album',
          refModel: StrikeTargetModel.Album,
        });

        if (currentState && currentState !== StrikeState.Created) {
          before(async function () {
            await Strike.updateOne({ _id: this.strike._id }, { state: currentState });
          });
        }

        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.post(
              `${testConfig.baseUrl}/admin/strikes/${this.strike._id}/${newState}`,
              {},
              { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
            );
          },
          !shouldFail ? 200 : 400,
          !shouldFail
            ? {
              mask: MASKING_FIELDS_POPULATED,
            }
            : {},
        );
      });

      describe('for other user', () => {
        specHelper.withStrike();

        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.post(
              `${testConfig.baseUrl}/strikes/${this.strike._id}/${newState}`,
              {},
              { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
            );
          },
          403,
        );
      });

      describe('for unauthorized', () => {
        specHelper.withStrike();

        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.post(
              `${testConfig.baseUrl}/strikes/${this.strike._id}/${newState}`,
              {},
            );
          },
          401,
        );
      });
    };
    describe('Revoke', () => {
      describe('valid flow', () => {
        createTest('revoke', undefined, false, true);
      });
      describe('invalid flow', () => {
        createTest('revoke', StrikeState.Confirmed, true);
      });
    });

    describe('Confirm', () => {
      describe('valid flow', () => {
        createTest('confirm');
      });
      describe('invalid flow', () => {
        createTest('confirm', StrikeState.Revoked, true);
      });
    });
  });
});
