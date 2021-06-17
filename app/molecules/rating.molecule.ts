import { Context, ServiceSchema } from 'moleculer';
import { Job } from 'bee-queue';
// @ts-ignore
import QueueService from 'moleculer-bee-queue';
import app from 'app';

const QUEUE_NAME = 'rating.update';

const { config: { redis }, modelProvider: { Review, User } } = app;

export default () => {
  const RatingService: ServiceSchema = {
    name: 'rating',
    mixins: [QueueService({ redis })],
    settings: {
    },
    actions: {
      update: {
        params: {
          properties: {
            targetUser: { type: 'string' },
          },
        },
        async handler(ctx: Context) {
          const job: Job = this.createJob(QUEUE_NAME, ctx.params);
          this.logger.info(`Rating job for ${job.data.targetUser} created`);
          await job.retries(2).save();
        },
      },
    },
    queues: {
      async [QUEUE_NAME](job: Job) {
        const { targetUser } = job.data;
        try {
          this.logger.info('Update rating for', targetUser);
          const rating = await Review.calculateRating(targetUser);
          await User.updateOne({ _id: targetUser }, { rating });
        } catch (err) {
          this.logger.error('Cannot update rating for', targetUser);
          this.logger.error(err);
          throw err;
        }
      },
    },
    methods: {
    },
  };
  return RatingService;
};
