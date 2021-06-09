import { Model, Mongoose, Schema } from 'mongoose';
import { NotificationDocument, NotificationTypeValues } from '../domains/notification';

const modelName = 'Notification';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     NotificationModelResponse:
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
 *         readable:
 *           type: boolean
 *         body:
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
    readable: {
      type: Boolean,
      default: true,
    },
    recipients: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    unread: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }],
    body: {
      type: String,
      required: true,
    },
    metadata: {},
  }, {
    timestamps: true,
  });

  schema.statics.removeFromUnread = function removeFromUnread(
    this: Model<NotificationDocument>,
    userId: string,
  ) {
    return this.updateMany({}, { $pull: { unread: userId } }, { multi: true });
  };

  schema.methods.removeDependencies = async function removeDependencies() {
    // put logic here
  };

  return mongoose.model<NotificationDocument>(modelName, schema);
};
