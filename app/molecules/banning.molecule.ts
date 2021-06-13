import { Context, ServiceSchema } from 'moleculer';
import app from 'app';
import { StrikeCreated, StrikeRevoked } from '../domains/molecules';
import { StrikeState } from '../domains/strike';
import { BanningReasonType } from '../domains/banning';

const {
  config: {
    banningStrategy: {
      strikeThreshold,
    },
  },
  consts: {
    events,
  },
  modelProvider,
  modelProvider: {
    Strike,
    User,
  },
} = app;

export default () => {
  const BanningService: ServiceSchema = {
    name: 'banning',
    events: {
      [events.strikes.created]: {
        async handler(ctx: Context<StrikeCreated>) {
          const { params: { targetUser } } = ctx;
          const count = await Strike.countDocuments({
            targetUser,
            state: { $ne: StrikeState.Revoked },
          });
          if (count >= strikeThreshold) {
            const hasJustBanned = await User.ban(
              targetUser,
              { banningReasonType: BanningReasonType.ByStrikes },
            );
            if (hasJustBanned) {
              await User.logout(targetUser);
            }
          }
        },
      },
      [events.strikes.revoked]: {
        async handler(ctx: Context<StrikeRevoked>) {
          const { params: { ref, refModel, targetUser } } = ctx;

          // if there is a referenced content (ref is not empty), it gets unbanned
          if (ref && refModel) {
            await modelProvider[refModel].unban(ref);
          }

          // If the owner is banned with reason ByStrikes, and Strike threshold gets inactive,
          // user gets unbanned
          const count = await Strike.countDocuments({
            targetUser,
            state: { $ne: StrikeState.Revoked },
          });
          if (count < strikeThreshold) {
            const user = await User.findById(targetUser).select('banningReasonType').lean()!;
            if (user && user.banningReasonType === BanningReasonType.ByStrikes) {
              await User.unban(targetUser);
            }
          }
        },
      },
    },
  };
  return BanningService;
};
