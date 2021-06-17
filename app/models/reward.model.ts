import { Mongoose, Schema } from 'mongoose';
import { RewardDocument } from '../domains/reward';

const modelName = 'Reward';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     RewardModel:
 *       type: object
 *       properties:
 *         reward:
 *           type: string
 *         description:
 *           type: string
 *         period:
 *           type: string
 *         place:
 *           type: integer
 *           enum:
 *             - 1
 *             - 2
 *             - 3
 *             - 4
 *             - 5
 *             - 6
 *             - 7
 *             - 8
 *             - 9
 *             - 10
 *     RewardModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         reward:
 *           type: string
 *         description:
 *           type: string
 *         period:
 *           type: string
 *         place:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    reward: {
      type: String,
      required: true,
    },
    description: String,
    period: String,
    place: {
      type: Number,
      min: 1,
      max: 10,
    },
  }, {
    timestamps: true,
  });
  return mongoose.model<RewardDocument>(modelName, schema);
};
