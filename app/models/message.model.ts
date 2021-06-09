import app from 'app';
import { Mongoose, Schema } from 'mongoose';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import { MessageDocument } from '../domains/message';
import { StrikeTypeValues } from '../domains/strike';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     ChatMessageResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         chat:
 *           type: string
 *         author:
 *           type: string
 *         body:
 *           type: string
 *         unread:
 *           type: array
 *           items:
 *             type: string
 *             description: _ids of unread users
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */

const modelName = 'Message';

export default (mongoose: Mongoose) => {
  const schema = new Schema({
    chat: {
      type: Schema.Types.ObjectId,
      ref: 'Chat',
      required: true,
    },
    author: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    body: {
      type: String,
      required: true,
    },
    unread: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
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

  schema.pre<MessageDocument>('save', function preSave(next) {
    this.wasNew = this.isNew;
    next();
  });

  schema.post('save', async (doc: MessageDocument) => {
    if (doc.wasNew) {
      const { modelProvider: { Chat } } = app;
      await Chat.incMessageCounter(doc.chat, 1);
    }
  });

  schema.post('remove', async (doc: MessageDocument) => {
    const { modelProvider: { Chat } } = app;

    await Chat.incMessageCounter(doc.chat, -1);
  });

  schema.statics.removeFromUnread = function removeFromUnread(userId: string) {
    return this.update({}, { $pull: { unread: userId } }, { multi: true });
  };

  schema.statics.removeDependencies = async function removeDependencies(userId: string) {
    const user = await this.findOne({ _id: userId });
    return user.removeDependencies();
  };

  schema.plugin(banContentPlugin.mongoose);

  return mongoose.model<MessageDocument>(modelName, schema);
};
