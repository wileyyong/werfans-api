import app from 'app';
import { expect } from 'chai';
import specHelper from 'test/helper/specHelper';
import { LiveStreamCompleted } from '../../app/domains/molecules';
import { GoalState } from '../../app/domains/goal';
import { BalanceRecordType } from '../../app/domains/balanceRecord';
import { BalanceRecordRefModel } from '../../app/domains/balanceRecordRefModel';

const {
  consts: { events },
  moleculerBroker,
  moleculerService,
  modelProvider: {
    BalanceRecord,
    Goal,
  },
} = app;

describe('goals Molecule', () => {
  describe('on liveStream.completed', () => {
    specHelper.withAdminUser();

    specHelper.withUser();
    specHelper.withLiveStream({
      shouldMakeOnAir: true,
    });

    specHelper.withUser({
      key: 'investorUser',
    });

    const checkGoalState = function (shouldExpire: boolean) {
      it(shouldExpire ? 'should expire' : 'should not expire', async function () {
        const goal = await Goal.findById(this.goal._id);
        return shouldExpire
          ? expect(goal!.state).to.be.equal(GoalState.Expired)
          : expect(goal!.state).not.to.be.equal(GoalState.Expired);
      });
      if (shouldExpire) {
        it('should create reverting records', async function () {
          const balanceRecords = await BalanceRecord.find(
            { _id: { $in: [this.balanceRecord1._id, this.balanceRecord2._id] } },
          );
          return expect(balanceRecords.length).to.be.equal(2);
        });
      }
    };

    const callEventHandler = () => {
      specHelper.withBalanceRecord({
        key: 'balanceRecord1',
        type: BalanceRecordType.SendTip,
        sum: -50,
        refKey: 'goal',
        refModel: BalanceRecordRefModel.Goal,
        ownerKey: 'investorUser',
      });
      specHelper.withBalanceRecord({
        key: 'balanceRecord2',
        type: BalanceRecordType.SendTip,
        sum: -50,
        refKey: 'goal',
        refModel: BalanceRecordRefModel.Goal,
        ownerKey: 'investorUser',
      });
      before(() => moleculerService.startBrokerWithServices(['goals']));
      after(() => moleculerService.stopBroker());
      before(async function () {
        await specHelper.callMoleculerEventHandler<LiveStreamCompleted>(
          moleculerBroker.getLocalService('goals'),
          events.liveStreams.completed,
          {
            _id: this.liveStream._id,
          },
        );
      });
    };
    describe('goal is not Active', () => {
      specHelper.withGoal();
      before('make goal Cancelled', function () {
        return Goal.updateOne({ _id: this.goal._id }, { state: GoalState.Cancelled });
      });
      callEventHandler();
      checkGoalState(false);
    });
    describe('goal is Active', () => {
      specHelper.withGoal();
      before('make goal Active', function () {
        return Goal.updateOne({ _id: this.goal._id }, { state: GoalState.Active });
      });
      callEventHandler();
      checkGoalState(true);
    });
  });
});
