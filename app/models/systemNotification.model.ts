import { Mongoose, Schema } from 'mongoose';
import { SystemNotificationDocument } from '../domains/systemNotification';
import { NotificationTypeValues } from '../domains/notification';

const modelName = 'SystemNotification';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     SystemNotificationModel:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         notificationType:
 *           type: string
 *           enum:
 *             - Testing
 *             - LiveStreamStarted
 *             - PrivateMessageReceived
 *             - VideoUploaded
 *         author:
 *           type: string
 *         sentAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     SystemNotificationModelList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         notificationType:
 *           type: string
 *           enum:
 *             - Testing
 *             - LiveStreamStarted
 *             - PrivateMessageReceived
 *             - VideoUploaded
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         sentAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */

module.exports = (mongoose: Mongoose) => {
  const schema = new Schema({
    notificationType: {
      type: String,
      enum: NotificationTypeValues,
      required: true,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    sentAt: {
      type: Date,
      default: null,
    },
  }, {
    timestamps: true,
  });

  schema.pre<SystemNotificationDocument>('save', function preSave(next) {
    if (this.isNew) {
      this.sentAt = new Date();
    }
    next();
  });

  return mongoose.model<SystemNotificationDocument>(modelName, schema);
};
