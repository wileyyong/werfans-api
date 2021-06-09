import { expect } from 'chai';
import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { Context } from 'mocha';
import { NotificationDomain } from '../../app/domains/notification';
import { GoalResource, GoalState } from '../../app/domains/goal';
import { LiveStreamState } from '../../app/domains/liveStream';

const {
  consts: { events },
  modelProvider: { Goal, LiveStream, User, Notification },
} = app;

const MASKING_FIELDS = [
  '_id',
  'liveStream',
  'owner',
  'createdAt',
  'updatedAt',
];

const MASKING_FIELDS_POPULATED = [
  '_id',
  'liveStream',
  'owner._id',
  'createdAt',
  'updatedAt',
];

describe('Goal', () => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
  const otherUserData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);

  const goalData = specHelper.getFixture(specHelper.FIXTURE_TYPES.GOAL);

  specHelper.withAdminUser();
  specHelper.withUser({
    key: 'user',
    data: userData,
  });
  specHelper.withLiveStream({
    key: 'liveStream',
    userKey: 'user',
    seed: 1,
    shouldMakeOnAir: true,
  });

  specHelper.withUser({
    key: 'otherUser',
    data: otherUserData,
  });
  specHelper.withLiveStream({
    key: 'otherLiveStream',
    userKey: 'otherUser',
    seed: 2,
  });

  before(async function (this: Context) {
    await User.updateOne(
      { _id: this.user._id },
      { $push: { subscribers: { $each: [this.otherUser._id] } } },
    );
  });

  describe('Create', () => {
    const createTest = (
      requestingUserKey: string|null,
      targetUserKey: string,
      errorCode?: number,
    ) => () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/${
              requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals`,
            { ...goalData, ...(requestingUserKey === 'adminUser' ? { owner: this[targetUserKey]._id } : {}) },
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 201,
        !errorCode
          ? { mask: MASKING_FIELDS }
          : {},
      );
      after('remove goal', function (this: Context) {
        return specHelper.removeGoal(this.response.body);
      });
    };

    describe('by admin', createTest('adminUser', 'user'));
    describe('by user', () => {
      describe('positive case', () => {
        let notifications: NotificationDomain[];
        before(async () => {
          notifications = await Notification.find().lean();
        });

        createTest('user', 'user')();

        after(() => specHelper.removeAllNotifications());

        it('should create notification', () => {
          expect(notifications.length).not.to.be.equal(0);
        });
      });
      describe('liveStream Completed', () => {
        before(function () {
          return LiveStream.updateOne(
            { _id: this.liveStream._id },
            { state: LiveStreamState.Completed },
          );
        });
        after(function () {
          return LiveStream.updateOne(
            { _id: this.liveStream._id },
            { state: LiveStreamState.OnAir },
          );
        });
        createTest('user', 'user', 400)();
      });
      describe('already has other goal', () => {
        specHelper.withGoal();
        createTest('user', 'user', 400)();
      });
    });
    describe('by other user', createTest('otherUser', 'user', 403));
    describe('by unauthorized', createTest(null, 'user', 401));
  });

  describe('Get list', () => {
    const createTest = (
      requestingUserKey: string|null,
      errorCode?: number,
    ) => () => {
      specHelper.withGoal();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/goals`,
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 200,
        !errorCode
          ? { mask: MASKING_FIELDS_POPULATED }
          : {},
      );
    };

    describe('by user', createTest('user'));
    describe('by other user', createTest('otherUser'));
    describe('by unauthorized', createTest(null, 401));
  });

  describe('Get one', () => {
    const createTest = (
      requestingUserKey: string|null,
      errorCode?: number,
    ) => () => {
      specHelper.withGoal();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/${
              requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}`,
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 200,
        !errorCode
          ? { mask: MASKING_FIELDS_POPULATED }
          : {},
      );
    };

    describe('by admin', createTest('adminUser'));
    describe('by user', createTest('user'));
    describe('by other user', createTest('otherUser'));
    describe('by unauthorized', createTest(null, 401));
  });

  describe('Update', () => {
    const createTest = (
      requestingUserKey: string|null,
      errorCode?: number,
      targetAmount?: number,
    ) => () => {
      specHelper.withGoal();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.patch(
            `${testConfig.baseUrl}/${
              requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}`,
            !targetAmount ? { title: 'reimbursement' } : { title: 'reimbursement', targetAmount },
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 200,
        !errorCode
          ? { mask: MASKING_FIELDS_POPULATED }
          : {},
      );
    };

    describe('by admin', createTest('adminUser'));
    describe('by user', () => {
      describe('positive case', () => {
        createTest('user')();
      });

      describe('should get notification with changed targetAmount', () => {
        let notifications: NotificationDomain[];
        before(async () => {
          notifications = await Notification.find().lean();
        });

        createTest('user', undefined, 200)();

        after(() => specHelper.removeAllNotifications());

        it('should create notification', () => {
          expect(notifications.length).not.to.be.equal(0);
        });
      });
    });
    describe('by other user', createTest('otherUser', 403));
    describe('by unauthorized', createTest(null, 401));
  });

  describe('Delete', () => {
    const createTest = (
      requestingUserKey: string|null,
      errorCode?: number,
    ) => () => {
      specHelper.withGoal();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.delete(
            `${testConfig.baseUrl}/${
              requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}`,
            {},
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 204,
        !errorCode
          ? undefined
          : {},
      );
    };

    describe('by admin', createTest('adminUser'));
    describe('by user', createTest('user'));
    describe('by other user', createTest('otherUser', 403));
    describe('by unauthorized', createTest(null, 401));
  });

  describe('Change state', () => {
    const createTest = (
      state: string,
      requestingUserKey: string|null,
      errorCode?: number,
    ) => () => {
      specHelper.withGoal();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/${
              requestingUserKey === 'adminUser' ? 'admin/' : ''}live-streams/${this.liveStream._id}/goals/${this.goal._id}/${state}`,
            {},
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 200,
        !errorCode
          ? { mask: [...MASKING_FIELDS_POPULATED, 'completedAt'] }
          : {},
      );
    };

    describe('to cancel', () => {
      const state = 'cancel';
      describe('by admin', createTest(state, 'adminUser'));
      describe('by user', createTest(state, 'user'));
      describe('by other user', createTest(state, 'otherUser', 403));
      describe('by unauthorized', createTest(state, null, 401));
    });

    describe('to complete', () => {
      const state = 'complete';
      describe('by admin', createTest(state, 'adminUser'));
      describe('by user', createTest(state, 'user'));
      describe('by other user', createTest(state, 'otherUser', 403));
      describe('by unauthorized', createTest(state, null, 401));
    });
  });

  describe('SendTip', () => {
    const createTest = (
      goalExtraData: Partial<GoalResource>,
      initialBalance: number,
      sum: number,
      errorCode: number,
      expectedBalance: number,
      expectedPaymentAccepted: boolean,
    ) => () => {
      const requestingUserKey = 'user';
      specHelper.resetUserBalance(initialBalance);
      specHelper.withGoal();
      before(function () {
        return Goal.updateOne({ _id: this.goal._id }, goalExtraData);
      });
      if (expectedPaymentAccepted) {
        specHelper.checkMoleculerEventEmit(events.payment.accepted, true, {
          mask: ['_id', 'owner', 'ref'],
        });
      } else {
        specHelper.checkMoleculerEventEmit(events.payment.accepted, false);
      }
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/live-streams/${this.liveStream._id}/goals/${
              this.goal._id}/tips`,
            { sum },
            requestingUserKey
              ? { headers: { Authorization: `Bearer ${this[requestingUserKey].auth.access_token}` } }
              : undefined,
          );
        },
        errorCode || 200,
        {},
      );
      if (expectedBalance !== undefined) {
        it(`balance should be ${expectedBalance}`, async function () {
          const { balance: userBalance } = await User.findById(this.user._id).select('balance').lean()!;
          expect(userBalance).to.be.equal(expectedBalance);
        });
      }
    };

    describe('when full sum accepted', createTest(
      {
        currentAmount: 100,
        targetAmount: 200,
      },
      100,
      100,
      200,
      0,
      true,
    ));

    describe('when sum reduced', createTest(
      {
        currentAmount: 190,
        targetAmount: 200,
      },
      100,
      100,
      200,
      90,
      true,
    ));

    describe('with sum over balance', createTest(
      {
        currentAmount: 0,
        targetAmount: 200,
      },
      99,
      100,
      400,
      99,
      false,
    ));

    describe('with already full goal', createTest(
      {
        currentAmount: 200,
        targetAmount: 200,
      },
      100,
      100,
      400,
      100,
      false,
    ));

    describe('with goal in wrong state', createTest(
      {
        currentAmount: 100,
        targetAmount: 200,
        state: GoalState.Expired,
      },
      100,
      100,
      400,
      100,
      false,
    ));
  });
});
