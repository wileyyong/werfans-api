import { Context, ServiceSchema } from 'moleculer';
import app from 'app';
import { PaymentAccepted } from '../domains/molecules';
import { GoalState } from '../domains/goal';
import { BalanceRecordType } from '../domains/balanceRecord';
import { BalanceRecordRefModel } from '../domains/balanceRecordRefModel';

const {
  consts: { events },
  modelProvider: { BalanceRecord, Goal, User },
} = app;

export default () => {
  const PaymentService: ServiceSchema = {
    name: 'payment',
    events: {
      [events.payment.accepted]: {
        async handler(ctx: Context<PaymentAccepted>) {
          const { params: { type } } = ctx;
          if (type === BalanceRecordType.SendTip) {
            await this.processSendTip(ctx);
          } else if (type === BalanceRecordType.GoalReached || type === BalanceRecordType.Sale) {
            await this.processGoalReachedAndSale(ctx);
          } else if (type === BalanceRecordType.PurchaseContent) {
            await this.processPurchaseContent(ctx);
          }
        },
      },
    },
    methods: {
      async processGoalReachedAndSale(ctx: Context<PaymentAccepted>) {
        const { params: { _id: balanceRecordId, owner, sum } } = ctx;
        const result = await User.updateOne({ _id: owner }, { $inc: { balance: sum } });
        if (result.nModified > 0) {
          await BalanceRecord.markProcessed(balanceRecordId);
        }
      },
      async processSendTip(ctx: Context<PaymentAccepted>) {
        const { params: { _id: balanceRecordId, ref, sum } } = ctx;
        const goal = await Goal.findOneAndUpdate(
          {
            _id: ref,
          },
          {
            $inc: { currentAmount: -1 * sum },
          },
          {
            new: true,
          },
        );
        if (!goal) {
          this.logger.error(`Cannot find goal with _id: ${ref}. Balance record ${balanceRecordId} skipped.`);
          return;
        }
        await BalanceRecord.markProcessed(balanceRecordId);
        if (goal.currentAmount >= goal.targetAmount) {
          goal.state = GoalState.Reached;
          await goal.save();
          await app.paymentService.processRecord({
            owner: goal.owner,
            type: BalanceRecordType.GoalReached,
            ref: goal._id,
            refModel: BalanceRecordRefModel.Goal,
            sum: goal.currentAmount,
          });
        }
      },
      async processPurchaseContent(ctx: Context<PaymentAccepted>) {
        const { params: { _id: balanceRecordId, owner, ref, refModel, sum } } = ctx;
        const result = await User.updateOne(
          { _id: owner },
          { $push: { purchases: { balanceRecord: balanceRecordId, ref, refModel } } },
        );
        if (result.nModified > 0) {
          await BalanceRecord.markProcessed(balanceRecordId);
          const { ref: contentData } = await BalanceRecord
            .findById(balanceRecordId)
            .select('ref refModel')
            .populate('ref')
            .lean()!;
          await app.paymentService.processRecord({
            owner: contentData.owner,
            type: BalanceRecordType.GoalReached,
            ref,
            refModel,
            sum: -1 * sum,
          });
        }
      },
    },
  };
  return PaymentService;
};
