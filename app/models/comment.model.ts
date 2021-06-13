import { Mongoose, Schema } from 'mongoose';
import { CommentDocument, CommentTargetValues } from '../domains/comment';

const modelName = 'Comment';

/**
 * @swagger
 * components:
 *   schemas:
 *     CommentModel:
 *       type: object
 *       properties:
 *         body:
 *           type: string
 *     CommentModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         target:
 *           type: string
 *         targetModel:
 *           type: string
 *         body:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     CommentModelResponse:
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
 *         target:
 *           type: string
 *         targetModel:
 *           type: string
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
    target: {
      type: Schema.Types.ObjectId,
      refPath: 'targetModel',
      required: true,
    },
    targetModel: {
      type: String,
      required: true,
      enum: CommentTargetValues,
    },
    body: {
      type: String,
      required: true,
    },
  }, {
    timestamps: true,
  });

  return mongoose.model<CommentDocument>(modelName, schema);
};
