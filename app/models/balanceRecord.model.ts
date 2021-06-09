import { Mongoose, Schema } from 'mongoose';
import { BalanceRecordDocument, BalanceRecordTypeValues } from '../domains/balanceRecord';
import { BalanceRecordRefModelValues } from '../domains/balanceRecordRefModel';

const modelName = 'BalanceRecord';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     BalanceRecordResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - LoadBalance
 *             - PurchaseContent
 *             - SendTips
 *         sum:
 *           type: number
 *         ref:
 *           type: string
 *         refModel:
 *           type: string
 *           enum:
 *             - Album
 *             - Goal
 *             - LiveStream
 *             - Photo
 *             - Video
 *         createdAt:
 *           type: string
 */

module.exports = (mongoose: Mongoose) => {
  const schema = new Schema({
    owner: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: BalanceRecordTypeValues,
      required: true,
    },
    sum: {
      type: Number,
      required: true,
    },
    ref: {
      type: Schema.Types.ObjectId,
      refPath: 'refModel',
    },
    refModel: {
      type: String,
      enum: BalanceRecordRefModelValues,
    },
    processedAt: Date,
  }, {
    timestamps: {
      updatedAt: false,
    },
  });

  schema.statics.markProcessed = function markProcessed(id: string): Promise<void> {
    return this.updateOne({ _id: id }, { processedAt: new Date() });
  };

  return mongoose.model<BalanceRecordDocument>(modelName, schema);
};
