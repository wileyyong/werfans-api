import { Mongoose, Schema } from 'mongoose';
import validate from 'mongoose-validator';
import { ReportDocument } from '../domains/report';

const modelName = 'Report';

const urlValidator = validate({
  validator: 'isURL',
  message: '{PATH} must be URL',
});

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     ReportModel:
 *       type: object
 *       properties:
 *         author:
 *           type: string
 *         complainUser:
 *           type: string
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *     ReportModelResponse:
 *       type: object
 *       properties:
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *         complainUser:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    complainUser: {
      type: mongoose.Schema.Types.ObjectId,
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
  }, {
    timestamps: true,
  });

  return mongoose.model<ReportDocument>(modelName, schema);
};
