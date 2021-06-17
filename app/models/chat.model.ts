import { Mongoose, Schema } from 'mongoose';
import app from 'app';
import { ChatDocument, ChatDomain, ChatType, ChatTypeValues } from '../domains/chat';
import { UserDocument } from '../domains/user';

const modelName = 'Chat';

/**
 * @swagger
 * components:
 *   schemas:
 *     ChatResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         chatType:
 *           type: string
 *           enum:
 *             - private
 *             - liveStream
 *         metadata:
 *           type: object
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         messagesCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *     ChatResponseWithUnread:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         chatType:
 *           type: string
 *           enum:
 *             - private
 *             - liveStream
 *         metadata:
 *           type: object
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         messagesCounter:
 *           type: integer
 *         unreadMessagesCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */

export default (mongoose: Mongoose) => {
  const schema = new mongoose.Schema({
    chatType: {
      type: String,
      enum: ChatTypeValues,
      required: true,
    },
    metadata: {
      type: Schema.Types.Mixed,
    },
    name: {
      type: String,
    },
    participants: [{
      type: Schema.Types.ObjectId,
      ref: 'User',
    }],
    messagesCounter: {
      type: Number,
      default: 0,
    },
  }, {
    timestamps: true,
  });

  schema.post('remove', async (doc: ChatDocument, next) => {
    try {
      await doc.removeDependencies();
      next();
    } catch (err) {
      next(err);
    }
  });

  schema.statics.createLiveStream = function createLiveStream(
    liveStreamId: string,
    ownerId: string,
  ): Promise<ChatDocument> {
    const createObj: Partial<ChatDomain> = {
      chatType: ChatType.LiveStream,
      participants: [ownerId],
      metadata: { liveStream: liveStreamId },
    };
    return this.create(createObj);
  };

  schema.statics.incMessageCounter = function incMessageCounter(id: string, value: number) {
    return this
      .updateOne(
        { _id: id },
        { $inc: { messagesCounter: value } },
      );
  };

  schema.statics.removeDependencies = async function removeDependencies(chatId: string) {
    const chat = await this.findOne({ _id: chatId });
    return chat.removeDependencies();
  };

  schema.statics.countUnreadMessages = function countUnreadMessages(
    chats: ChatDocument[],
    user: string | UserDocument,
  ) {
    const { modelProvider: { Message } } = app;
    return Promise.all(chats.map(async (chat) => {
      // Count all the unread messages, except those that are still uploading
      chat.unreadMessagesCounter = await Message.countDocuments({
        chat: chat._id,
        unread: (user as UserDocument)._id || (user as string),
        videoUrls: { $nin: ['uploading.com'] },
      });
      return chat;
    }));
  };

  schema.methods.removeDependencies = function removeDependencies() {
    const { modelProvider: { Message } } = app;
    return Message.remove({ chat: this.id });
  };

  return mongoose.model<ChatDocument>(modelName, schema);
};
