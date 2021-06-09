import { ServiceSchema } from 'moleculer';
// @ts-ignore
import Cron from 'moleculer-cron';
import app from 'app';
import { NotificationType } from '../domains/notification';
import { LiveStreamDocument } from '../domains/liveStream';

const { config: { isMigration, isTest }, modelProvider: { LiveStream, User } } = app;

export default () => {
  const LiveStreamsService: ServiceSchema = {
    name: 'liveStreams',
    mixins: [Cron],
    crons: [
      {
        name: 'CheckScheduledLiveStreams',
        cronTime: '* * * * *',
        manualStart: isMigration || isTest,
        onTick() {
          return this.getLocalService('liveStreams').checkScheduled();
        },
      },
    ],
    methods: {
      async checkScheduled() {
        const currentDate = new Date();
        await LiveStream
          .updateMany(
            {
              scheduledStartingAt: { $lte: currentDate },
              startingProcessedAt: { $exists: false },
            },
            {
              startingProcessedAt: currentDate,
            },
          );

        // fetch just updated
        const liveStreamList: LiveStreamDocument[] = await LiveStream
          .find({ startingProcessedAt: currentDate })
          .select('_id owner')
          .lean();

        await Promise.all(liveStreamList.map(async ({ _id: liveStreamId, owner }) => {
          const recipients = await User.getSubscribersOf(owner);
          await app.notificationService.createNotification<{ liveStream: string }>({
            notificationType: NotificationType.LiveStreamStarting,
            body: 'LiveStream is starting',
            metadata: {
              liveStream: liveStreamId,
              owner,
            },
            recipients,
          });
        }));
      },
    },
  };
  return LiveStreamsService;
};
