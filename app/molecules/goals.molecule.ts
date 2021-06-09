import { Context, ServiceSchema } from 'moleculer';
import app from 'app';
import { LiveStreamCompleted } from '../domains/molecules';
import { GoalState } from '../domains/goal';
import { BalanceRecordDocument, BalanceRecordType } from '../domains/balanceRecord';
import { BalanceRecordRefModel } from '../domains/balanceRecordRefModel';

const {
  consts: { events },
  modelProvider: { BalanceRecord, Goal },
} = app;

export default () => {
  const GoalsService: ServiceSchema = {
    name: 'goals',
    events: {
      [events.liveStreams.completed]: {
        async handler(ctx: Context<LiveStreamCompleted>) {
          const { params: { _id: liveStreamId } } = ctx;
          const goal = await Goal.findOneAndUpdate(
            {
              liveStream: liveStreamId,
              state: GoalState.Active,
            },
            {
              state: GoalState.Expired,
            },
          );
          if (goal) {
            const balanceRecords = await BalanceRecord
              .find({
                type: BalanceRecordType.SendTip,
                processedAt: { $exists: true },
                ref: goal!._id,
              })
              .lean();
            await Promise.all(balanceRecords.map((balanceRecord: BalanceRecordDocument) => (
              app.paymentService.processRecord({
                owner: balanceRecord.owner,
                type: BalanceRecordType.Reverting,
                ref: balanceRecord._id,
                refModel: BalanceRecordRefModel.BalanceRecord,
                sum: -1 * balanceRecord.sum,
              })
            )));
          }
        },
      },
    },
  };
  return GoalsService;
};
