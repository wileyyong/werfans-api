import { Types } from 'mongoose';
import HTTP_STATUSES from 'http-status-node';
import app from 'app';
import BaseController from 'app/lib/base.restdone.controller';
import unreadFieldPlugin from 'app/lib/restdone.plugin/unread-field.restdone.plugin';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import { NotificationType } from '../../domains/notification';
import { MessageDocument, MessageResource } from '../../domains/message';
import { Scope } from '../../domains/app';
import { IllegalStateError } from '../../lib/helpers/exceptions';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';

const {
  modelProvider: { Chat, Message },
} = app;

/**
 * @swagger
 *
 * /chats/{chat}/messages:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Messages
 *     summary: Creates a message
 *     operationId: createMessage
 *     parameters:
 *       - in: path
 *         name: chat
 *         description: chat _id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *                 description: message body
 *             required:
 *               - body
 *     responses:
 *       '201':
 *         description: returns created message
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ChatMessageResponse'
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Messages
 *     summary: Returns array of message of the chat.
 *     operationId: getChatMessages
 *     parameters:
 *       - in: path
 *         name: chat
 *         description: chat _id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: Returns array of message of the chat.
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ChatMessageResponse'
 * /chats/{chat}/messages/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Messages
 *     summary: Returns message by id.
 *     operationId: getMessageById
 *     parameters:
 *       - in: path
 *         name: chat
 *         description: chat _id
 *         required: true
 *         schema:
 *           type: string
 *           description: chat _id
 *       - in: path
 *         name: _id
 *         description: message _id
 *         required: true
 *         schema:
 *           type: string
 *           description: message _id
 *     responses:
 *       '200':
 *         description: returns user's chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ChatMessageResponse'
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Messages
 *     summary: Updates message by id.
 *     operationId: updateMessageById
 *     parameters:
 *       - in: path
 *         name: chat
 *         description: chat _id
 *         required: true
 *         schema:
 *           type: string
 *           description: chat _id
 *       - in: path
 *         name: _id
 *         description: message _id
 *         required: true
 *         schema:
 *           type: string
 *           description: message _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               body:
 *                 type: string
 *                 description: message body
 *             required:
 *               - body
 *     responses:
 *       '200':
 *         description: returns updated chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ChatMessageResponse'
 * /chats/{chat}/messages/unread:
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Messages
 *     summary: Removes current user from unread users of all messages of this chat
 *     operationId: makeAllRead
 *     parameters:
 *       - in: path
 *         name: chat
 *         description: chat _id
 *         required: true
 *         schema:
 *           type: string
 *           description: chat _id
 *     responses:
 *       '204':
 *         description: Empty response
 * /chats/{chat}/messages/{_id}/unread:
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Messages
 *     summary: Removes current user from unread users of message
 *     operationId: makeMessageRead
 *     parameters:
 *       - in: path
 *         name: chat
 *         description: chat _id
 *         required: true
 *         schema:
 *           type: string
 *           description: chat _id
 *       - in: path
 *         name: _id
 *         description: message _id
 *         required: true
 *         schema:
 *           type: string
 *           description: message _id
 *     responses:
 *       '204':
 *         description: Empty response
 */

class MessageController extends BaseController<
MessageDocument,
Record<string, any>,
MessageResource
> {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: Message,
        },
      },
      path: ['/chats/:chat/messages', '/messages'],
      expandForAdmin: true,
      fields: [
        'chat',
        'author',
        'body',
        'unread',
        'createdAt',
        'updatedAt',
      ],
      readOnlyFields: ['unread', 'createdAt', 'updatedAt'],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
      },
      plugins: [
        {
          plugin: unreadFieldPlugin.restdone,
          options: {
            Model: Message,
            afterRemove(scope: Scope<MessageDocument>) {
              const { params: { _id: id, chat: chatId } } = scope;
              const socket = scope.getSocket();
              if (socket) {
                socket.broadcast
                  .to(`chat#${chatId}`)
                  .emit(`chat#${chatId}-read-message`, { data: { message: { _id: id } } });
              }
            },
            afterRemoveAll(scope: Scope<MessageDocument>) {
              const { params: { chat: chatId } } = scope;
              const socket = scope.getSocket();
              if (socket) {
                socket.broadcast
                  .to(`chat#${chatId}`)
                  .emit(`chat#${chatId}-read-chat`, { data: { } });
              }
            },
          },
        },
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'author',
          },
        },
        /**
         * @swagger
         *
         * /admin/messages/{id}/ban:
         *   post:
         *     tags:
         *       - Messages
         *     security:
         *       - Bearer Token: []
         *       - OauthSecurity: []
         *     summary: ban video by id
         *     operationId: videosBan
         *     parameters:
         *       - name: id
         *         in: path
         *         required: true
         *         schema:
         *           type: string
         *           description: video id.
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               banningReasonType:
         *                 type: string
         *                 enum:
         *                   - abuse
         *                   - nudity
         *                   - spam
         *               banningReasonDescription:
         *                 type: string
         *     responses:
         *       '204':
         *         description: Empty response
         *
         * /admin/messages/{id}/unban:
         *   post:
         *     tags:
         *       - Messages
         *     security:
         *       - Bearer Token: []
         *       - OauthSecurity: []
         *     summary: unban video by id
         *     operationId: videosUnban
         *     parameters:
         *       - name: id
         *         in: path
         *         required: true
         *         schema:
         *           type: string
         *           description: video id.
         *     responses:
         *       '204':
         *         description: Empty response
         */
        {
          plugin: banContentPlugin.restdone,
          options: {
            Model: Message,
            targetUserFieldName: 'author',
          },
        },
      ],
    });

    super(options);
  }

  async pre(scope: Scope<MessageDocument>) {
    const { context, params, params: { chat }, user: currentUser } = scope;
    let { params: { author } } = scope;
    if (!currentUser) {
      throw new IllegalStateError('No user');
    }

    if (!author) {
      author = currentUser.id;
      if (!scope.isSelect()) {
        params.author = author;
      }
    } else if (!scope.isAdminMode && author !== currentUser.id) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }

    if (!scope.isAdminMode) {
      const chatDoc = await Chat
        .findOne({ _id: chat, participants: author }).select('participants').lean();
      if (!chatDoc) {
        throw HTTP_STATUSES.BAD_REQUEST.createError(`Wrong chat: ${chat}`);
      }
      context.chat = chatDoc;
    }

    if (!scope.isAdminMode) {
      params.$or = [{ suspendedAt: { $exists: false } }, { author: currentUser._id }];
    }
  }

  async beforeSave(scope: Scope<MessageDocument>) {
    const { model, context: { chat: { participants } } } = scope;
    model.unread = participants.filter((userId: Types.ObjectId) => !userId.equals(model.author));
  }

  async afterSave(scope: Scope<MessageDocument>) {
    const { model: message, context: { chat } } = scope;
    const socket = scope.getSocket();
    if (scope.isInsert()) {
      await app.notificationService.createNotification({
        notificationType: NotificationType.PrivateMessageReceived,
        body: 'Private message received',
        metadata: {
          chat: chat._id,
        },
        recipients: chat.participants
          .filter((participant: Types.ObjectId) => !message.author.equals(participant)),
      });
      if (socket) {
        socket.broadcast
          .to(`chat#${chat._id}`)
          .emit(`chat#${chat._id}-new-message`, { data: { message } });
      }
    } else if (scope.isUpdate() && socket) {
      socket.broadcast
        .to(`chat#${chat._id}`)
        .emit(`chat#${chat._id}-update-message`, { data: { message } });
    }
  }
}

module.exports = MessageController;
