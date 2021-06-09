import { Mongoose, Schema } from 'mongoose';
import validate from 'mongoose-validator';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import { VideoDocument } from '../domains/video';
import { StrikeTypeValues } from '../domains/strike';

const modelName = 'Video';

const urlValidator = validate({
  validator: 'isURL',
  message: '{PATH} must be URL',
});

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     VideoModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         duration:
 *           type: integer
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *           enum:
 *             - 0
 *             - 1
 *             - 2
 *             - 3
 *             - 4
 *             - 5
 *         coverUrl:
 *           type: string
 *         url:
 *           type: string
 *           required: true
 *         publicUrl:
 *           type: string
 *     VideoModelResponseCreated:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         duration:
 *           type: integer
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         url:
 *           type: string
 *           required: true
 *         publicUrl:
 *           type: string
 *         viewsCounter:
 *           type: integer
 *         commentsCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *         owner:
 *           type: string
 *     VideoModelResponseList:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         duration:
 *           type: integer
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         url:
 *           type: string
 *           required: true
 *         publicUrl:
 *           type: string
 *         viewsCounter:
 *           type: integer
 *         commentsCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 */

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    name: {
      type: String,
      required: true,
    },
    description: String,
    price: Number,
    duration: Number,
    watermarkUrl: {
      type: String,
      validate: urlValidator,
    },
    watermarkOpacity: {
      type: Number,
      min: 0,
      max: 5,
    },
    coverUrl: {
      type: String,
      validate: urlValidator,
    },
    url: {
      type: String,
      required: true,
      validate: urlValidator,
    },
    publicUrl: {
      type: String,
      validate: urlValidator,
    },
    viewsCounter: {
      type: Number,
      default: 0,
    },
    commentsCounter: {
      type: Number,
      default: 0,
    },
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    banningReasonType: {
      type: String,
      enum: StrikeTypeValues,
    },
    banningReasonDescription: {
      type: String,
    },
  }, {
    timestamps: true,
  });

  /**
   * suspendedAt: Date,
   */
  schema.plugin(banContentPlugin.mongoose);

  return mongoose.model<VideoDocument>(modelName, schema);
};
