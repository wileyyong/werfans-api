import { Mongoose, Schema } from 'mongoose';
import validate from 'mongoose-validator';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import { LiveStreamDocument, LiveStreamState, LiveStreamStateValues } from '../domains/liveStream';

const modelName = 'LiveStream';

const urlValidator = validate({
  validator: 'isURL',
  message: '{PATH} must be URL',
});

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     LiveStreamModel:
 *       type: object
 *       properties:
 *         duration:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *     LiveStreamModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         duration:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *         likedUsersCounter:
 *           type: integer
 *         viewersCounter:
 *           type: integer
 *         likedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               username:
 *                 type: string
 *         viewsCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         owner:
 *           type: string
 *         state:
 *           type: string
 *           enum:
 *             - created
 *             - scheduled
 *             - onAir
 *             - completed
 *     LiveStreamModelResponseList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         duration:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         state:
 *           type: string
 *           enum:
 *             - created
 *             - scheduled
 *             - onAir
 *             - completed
 *         likedUsersCounter:
 *           type: integer
 *         viewersCounter:
 *           type: integer
 *         likedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               username:
 *                 type: string
 *         favoritedUsers:
 *           type: array
 *           items: string
 *         favoritedUsersCounter:
 *           type: integer
 *         viewsCounter:
 *           type: integer
 *         scheduledStartingAt:
 *           type: string
 *         scheduledAt:
 *           type: string
 *         startedAt:
 *           type: string
 *         stoppedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    duration: {
      type: Number,
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    coverUrl: {
      type: String,
      validate: urlValidator,
    },
    url: {
      type: String,
      validate: urlValidator,
    },
    publicUrl: {
      type: String,
      validate: urlValidator,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    state: {
      type: String,
      enum: LiveStreamStateValues,
      default: LiveStreamState.Created,
    },
    viewsCounter: {
      type: Number,
      default: 0,
    },
    startingProcessedAt: Date,
    scheduledStartingAt: Date,
    scheduledAt: Date,
    startedAt: Date,
    stoppedAt: Date,
  }, {
    timestamps: true,
  });

  schema.methods.changeState = function changeState(newState: LiveStreamState) {
    const liveStream = <LiveStreamDocument>this
    const { state: currentState } = liveStream;
    if (
      (currentState === LiveStreamState.Created && newState === LiveStreamState.Scheduled)
      || (currentState === LiveStreamState.Created && newState === LiveStreamState.OnAir)
      || (currentState === LiveStreamState.Scheduled && newState === LiveStreamState.OnAir)
      || (currentState === LiveStreamState.OnAir && newState === LiveStreamState.Completed)
    ) {
      liveStream.state = newState;
      return true;
    } else {
      return false;
    }
  };

  schema.plugin(arrayWithCounterPlugin.mongoose, {
    array: {
      path: 'likedUsers',
      options: [{
        ref: 'User',
      }],
    },
    mongoose,
  });

  schema.plugin(arrayWithCounterPlugin.mongoose, {
    array: {
      path: 'favoritedUsers',
      options: [{
        ref: 'User',
      }],
    },
    mongoose,
  });

  schema.statics.findFavoriteLiveStreamsForUser = async function findFavoriteLiveStreamsForUser(
    userId: string,
  ) {
    const query = { favoritedUsers: { $in: [userId] } };
    const liveStreams = await mongoose.model('LiveStream').find(query).lean();

    return liveStreams;
  };

  schema.plugin(arrayWithCounterPlugin.mongoose, {
    array: {
      path: 'viewers',
      options: [{
        ref: 'User',
      }],
    },
    mongoose,
  });

  return mongoose.model<LiveStreamDocument>(modelName, schema);
};
