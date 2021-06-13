import app from 'app';
import { expect } from 'chai';
import specHelper from 'test/helper/specHelper';
import { PaymentAccepted } from '../../app/domains/molecules';
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
    User,
  },
} = app;

describe('payment Molecule', () => {
  describe('on payment.accepted', () => {
    const checkProcessedAt = function (shouldSet: boolean) {
      it(shouldSet ? 'should set processedAt' : 'should not set processedAt', async function () {
        const balanceRecord = await BalanceRecord.findById(this.balanceRecord._id);
        return shouldSet
          ? expect(balanceRecord!.processedAt).to.be.not.undefined
          : expect(balanceRecord!.processedAt).to.be.undefined;
      });
    };

    describe('GoalReached', () => {
      specHelper.withUser();
      specHelper.resetUserBalance();
      specHelper.withLiveStream({
        shouldMakeOnAir: true,
      });
      specHelper.withGoal();

      before(function () {
        return Goal.updateOne(
          { _id: this.goal._id },
          { state: GoalState.Reached, currentAmount: 500 },
        );
      });

      const checkUser = function () {
        it('should add 500 to balance', async function () {
          const user = await User.findById(this.user._id);
          return expect(user!.balance).to.be.equal(500);
        });
      };

      const callEventHandler = () => {
        specHelper.withGoal();
        const commonData = {
          type: BalanceRecordType.GoalReached,
          refModel: BalanceRecordRefModel.Goal,
          sum: 500,
        };
        specHelper.withBalanceRecord({
          refKey: 'goal',
          ...commonData,
        });
        before(() => moleculerService.startBrokerWithServices(['payment']));
        after(() => moleculerService.stopBroker());
        before(async function () {
          await specHelper.callMoleculerEventHandler<PaymentAccepted>(
            moleculerBroker.getLocalService('payment'),
            events.payment.accepted,
            {
              _id: this.balanceRecord._id,
              owner: this.balanceRecord.owner,
              ref: this.goal._id,
              ...commonData,
            },
          );
        });
      };

      callEventHandler();
      checkUser();
      checkProcessedAt(true);
    });

    describe('Sale', () => {
      specHelper.withUser();
      specHelper.resetUserBalance();
      specHelper.withLiveStream();

      const checkUser = function () {
        it('should add 300 to balance', async function () {
          const user = await User.findById(this.user._id);
          return expect(user!.balance).to.be.equal(300);
        });
      };

      const callEventHandler = () => {
        specHelper.withGoal();
        const commonData = {
          type: BalanceRecordType.Sale,
          refModel: BalanceRecordRefModel.LiveStream,
          sum: 300,
        };
        specHelper.withBalanceRecord({
          refKey: 'liveStream',
          ...commonData,
        });
        before(() => moleculerService.startBrokerWithServices(['payment']));
        after(() => moleculerService.stopBroker());
        before(async function () {
          await specHelper.callMoleculerEventHandler<PaymentAccepted>(
            moleculerBroker.getLocalService('payment'),
            events.payment.accepted,
            {
              _id: this.balanceRecord._id,
              owner: this.balanceRecord.owner,
              ref: this.liveStream._id,
              ...commonData,
            },
          );
        });
      };

      callEventHandler();
      checkUser();
      checkProcessedAt(true);
    });

    describe('SendTip', () => {
      specHelper.withUser();
      specHelper.withLiveStream({
        shouldMakeOnAir: true,
      });

      specHelper.withUser({
        key: 'investorUser',
      });

      const checkGoal = function (shouldIncrease: boolean, shouldReach: boolean) {
        it(shouldIncrease ? 'should increase' : 'should not increase', async function () {
          const goal = await Goal.findById(this.goal._id);
          return shouldIncrease
            ? expect(goal!.currentAmount).to.be.greaterThan(0)
            : expect(goal!.currentAmount).to.be.equal(0);
        });
        it(shouldReach ? 'should set Reached state' : 'should not set Reached state', async function () {
          const goal = await Goal.findById(this.goal._id);
          return shouldReach
            ? expect(goal!.state).to.be.equal(GoalState.Reached)
            : expect(goal!.state).to.be.equal(GoalState.Active);
        });
      };

      const callEventHandler = (payload: Partial<PaymentAccepted> = {}) => {
        specHelper.withGoal();
        const commonData = {
          type: BalanceRecordType.SendTip,
          refModel: BalanceRecordRefModel.Goal,
          sum: -100,
        };
        specHelper.withBalanceRecord({
          ownerKey: 'investorUser',
          refKey: 'goal',
          ...commonData,
          ...payload,
        });
        before(() => moleculerService.startBrokerWithServices(['payment']));
        after(() => moleculerService.stopBroker());
        before(async function () {
          await specHelper.callMoleculerEventHandler<PaymentAccepted>(
            moleculerBroker.getLocalService('payment'),
            events.payment.accepted,
            {
              _id: this.balanceRecord._id,
              owner: this.balanceRecord.owner,
              ref: this.goal._id,
              ...commonData,
              ...payload,
            },
          );
        });
      };
      describe('target state', () => {
        describe('when enough to reach', () => {
          specHelper.checkMoleculerEventEmit(events.payment.accepted, true, {
            mask: ['_id', 'owner', 'ref'],
          });
          callEventHandler({
            sum: -100,
          });
          checkGoal(true, true);
          checkProcessedAt(true);
        });
        describe('when not enough to reach', () => {
          callEventHandler({
            sum: -99,
          });
          checkGoal(true, false);
          checkProcessedAt(true);
        });
      });
      describe('other state', () => {
        callEventHandler({
          type: BalanceRecordType.LoadBalance,
        });
        checkGoal(false, false);
        checkProcessedAt(false);
      });
    });

    describe('PurchaseContent', () => {
      specHelper.withUser();
      before(function () {
        return User.updateOne(
          { _id: this.user._id },
          { purchases: [] },
        );
      });
      specHelper.withLiveStream();

      const checkUser = function () {
        it('should add liveStream to purchases', async function () {
          const user = await User.findById(this.user._id);
          expect(specHelper.maskPaths(user!.toObject().purchases, [
            'balanceRecord',
            'ref',
          ])).matchSnapshot(this);
          expect(user?.purchases[0]?.ref?.toString()).to.be.equal(this.liveStream._id);
        });
      };

      const callEventHandler = () => {
        const commonData = {
          type: BalanceRecordType.PurchaseContent,
          refModel: BalanceRecordRefModel.LiveStream,
          sum: 1,
        };
        specHelper.withBalanceRecord({
          refKey: 'liveStream',
          ...commonData,
        });
        before(() => moleculerService.startBrokerWithServices(['payment']));
        after(() => moleculerService.stopBroker());
        before(async function () {
          await specHelper.callMoleculerEventHandler<PaymentAccepted>(
            moleculerBroker.getLocalService('payment'),
            events.payment.accepted,
            {
              _id: this.balanceRecord._id,
              owner: this.balanceRecord.owner,
              ref: this.liveStream._id,
              ...commonData,
            },
          );
        });
      };

      specHelper.checkMoleculerEventEmit(events.payment.accepted, true, {
        mask: ['_id', 'owner', 'ref'],
      });
      callEventHandler();
      checkUser();
      checkProcessedAt(true);
    });
  });
});
