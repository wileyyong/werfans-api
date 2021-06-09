import { Mongoose, Schema } from 'mongoose';
import { UserConfigDocument } from '../domains/userConfig';

const modelName = 'UserConfig';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     UserConfigModel:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         key:
 *           type: string
 *         data:
 *           type: object
 *     UserConfigModelResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         key:
 *           type: string
 *         data:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    key: {
      type: String,
      required: true,
    },
    data: {
      type: Schema.Types.Mixed,
      required: true,
    },
  }, {
    timestamps: true,
  });

  schema.index({ user: 1, key: 1 }, { unique: true });

  return mongoose.model<UserConfigDocument>(modelName, schema);
};
