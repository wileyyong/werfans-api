import { Context, ServiceSchema } from 'moleculer';
import app from 'app';
import { NotificationType } from '../domains/notification';
import { StrikeCreated } from '../domains/molecules';

const {
  consts: {
    events,
  },
} = app;

export default () => {
  const StrikesService: ServiceSchema = {
    name: 'strikes',
    events: {
      [events.strikes.created]: {
        async handler(ctx: Context<StrikeCreated>) {
          return app.notificationService.createNotification<{ strike: string }>({
            notificationType: NotificationType.StrikeCreated,
            body: 'Strike created',
            metadata: {
              strike: ctx.params._id,
            },
            recipients: [ctx.params.targetUser],
          });
        },
      },
    },
  };
  return StrikesService;
};
