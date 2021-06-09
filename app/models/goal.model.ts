import HTTP_STATUSES from 'http-status-node';
import { Mongoose, Schema } from 'mongoose';
import { GoalDocument, GoalState, GoalStateValues } from '../domains/goal';

const modelName = 'Goal';

/**
 * @swagger
 * components:
 *   schemas:
 *     GoalModel:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         targetAmount:
 *           type: integer
 *         currentAmount:
 *           type: integer
 *         state:
 *           type: string
 *           enum:
 *             - active
 *             - completed
 *             - cancelled
 *         completedAt:
 *           type: string
 *     GoalModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           type: string
 *         title:
 *           type: string
 *         targetAmount:
 *           type: integer
 *         currentAmount:
 *           type: integer
 *         state:
 *           type: string
 *         completedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     GoalModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         title:
 *           type: string
 *         targetAmount:
 *           type: integer
 *         currentAmount:
 *           type: integer
 *         state:
 *           type: string
 *         completedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

module.exports = (mongoose: Mongoose) => {
  const schema = new Schema({
    liveStream: {
      type: Schema.Types.ObjectId,
      ref: 'LiveStream',
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    title: String,
    targetAmount: {
      type: Number,
      required: true,
    },
    currentAmount: {
      type: Number,
      default: 0,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    state: {
      type: String,
      required: true,
      enum: GoalStateValues,
      default: GoalState.Active,
    },
  }, {
    timestamps: true,
  });

  schema.methods.changeState = function changeState(newState: GoalState) {
    const { state: currentState } = this;
    if (
      (currentState === GoalState.Active && newState === GoalState.Cancelled)
      || (currentState === GoalState.Active && newState === GoalState.Reached)
    ) {
      this.state = newState;
      return true;
    } else {
      return false;
    }
  };

  schema.methods.updateState = async function updateState(goalId: string, state: string) {
    const goal = this;
    if (goal.changeState(state)) {
      if (state === GoalState.Reached) {
        goal.completedAt = Date.now();
      }
      return goal;
    } else {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }
  };

  return mongoose.model<GoalDocument>(modelName, schema);
};
