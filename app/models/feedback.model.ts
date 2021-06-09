import validate from 'mongoose-validator';
import { Mongoose, Schema } from 'mongoose';
import { FeedbackDocument, FeedbackTypeValues } from '../domains/feedback';

const urlValidator = validate({
  validator: 'isURL',
  message: '{PATH} must be URL',
});
const modelName = 'Feedback';

/**
 * @swagger
 * components:
 *   schemas:
 *     FeedbackModel:
 *       type: object
 *       properties:
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - suggestion
 *             - supportRequest
 *     FeedbackModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         type:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     FeedbackModelResponse:
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
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         type:
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
    body: {
      type: String,
      required: true,
    },
    photoUrl: {
      type: String,
      validate: urlValidator,
    },
    type: {
      type: String,
      required: true,
      enum: FeedbackTypeValues,
    },
  }, {
    timestamps: true,
  });

  return mongoose.model<FeedbackDocument>(modelName, schema);
};
