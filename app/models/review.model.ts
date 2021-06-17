import { Mongoose, Schema, Types } from 'mongoose';
import { ReviewDocument } from '../domains/review';

const modelName = 'Review';

/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewModel:
 *       type: object
 *       properties:
 *         author:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         body:
 *           type: string
 *     ReviewModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         targetUser:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         body:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     ReviewModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
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
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         body:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

module.exports = (mongoose: Mongoose) => {
  const schema = new Schema({
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    targetUser: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
  }, {
    timestamps: true,
  });

  schema.statics.calculateRating = async function calculateRating(
    targetUser: string,
  ): Promise<number> {
    const result = await this
      .aggregate()
      .match({ targetUser: Types.ObjectId(targetUser) })
      .group({ _id: null, avgRating: { $avg: '$rating' } });
    return result[0].avgRating;
  };

  return mongoose.model<ReviewDocument>(modelName, schema);
};
