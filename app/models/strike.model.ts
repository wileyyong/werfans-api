import { Mongoose, Schema } from 'mongoose';
import {
  StrikeDocument,
  StrikeState,
  StrikeStateValues,
  StrikeTargetModelValues,
  StrikeTypeValues,
} from '../domains/strike';

const modelName = 'Strike';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     StrikeModel:
 *       type: object
 *       properties:
 *         creator:
 *           type: string
 *         targetUser:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - abuse
 *             - nudity
 *             - spam
 *         description:
 *           type: string
 *         ref:
 *           type: string
 *         state:
 *           type: string
 *           enum:
 *             - created
 *             - confirmed
 *             - revoked
 *     StrikeModelResponseList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         creator:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         targetUser:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         type:
 *           type: string
 *           enum:
 *             - abuse
 *             - nudity
 *             - spam
 *         description:
 *           type: string
 *         ref:
 *           type: string
 *         state:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *     StrikeModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         creator:
 *           type: string
 *         targetUser:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - abuse
 *             - nudity
 *             - spam
 *         description:
 *           type: string
 *         state:
 *           type: string
 *         ref:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */

module.exports = (mongoose: Mongoose) => {
  const schema = new Schema({
    creator: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: StrikeTypeValues,
    },
    description: {
      type: String,
    },
    ref: {
      type: Schema.Types.ObjectId,
      refPath: 'refModel',
    },
    refModel: {
      type: String,
      enum: StrikeTargetModelValues,
    },
    state: {
      type: String,
      enum: StrikeStateValues,
      default: StrikeState.Created,
    },
  }, {
    timestamps: true,
  });

  schema.methods.changeState = function changeState(newState: StrikeState) {
    const { state: currentState } = this;
    if (
      (currentState === StrikeState.Created && newState === StrikeState.Confirmed)
      || (currentState === StrikeState.Created && newState === StrikeState.Revoked)
    ) {
      this.state = newState;
      return true;
    } else {
      return false;
    }
  };

  return mongoose.model<StrikeDocument>(modelName, schema);
};
