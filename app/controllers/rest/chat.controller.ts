/**
 * Created by mk on 11/23/15.
 */

import HTTP_STATUSES from 'http-status-node';
import { Types } from 'mongoose';
import app from 'app';
import BaseController from 'app/lib/base.restdone.controller';
import { ChatDocument, ChatResource, ChatType } from '../../domains/chat';
import { Scope } from '../../domains/app';
import { IllegalStateError } from '../../lib/helpers/exceptions';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';

const { modelProvider: { Chat } } = app;

interface IChatTypeHandler {
  getSelector: (scope: Scope) => Record<string, any>,
  getUpdater?: (scope: Scope) => Record<string, any>,
  shouldCreateByDemand?: true,
}

const chatTypeHandlers: Record<
ChatType,
IChatTypeHandler
> = {
  [ChatType.Private]: {
    getSelector(scope: Scope) {
      const userId = Types.ObjectId(scope.user!._id);
      const otherUserId = Types.ObjectId(scope.params.typeParam);
      if (userId.equals(otherUserId)) {
        throw HTTP_STATUSES.BAD_REQUEST.createError('Wrong interlocutor');
      }
      return {
        participants: {
          $all: [
            { $elemMatch: { $eq: userId } },
            { $elemMatch: { $eq: otherUserId } },
          ],
        },
      };
    },
    getUpdater(scope: Scope) {
      return { participants: [scope.user!._id, scope.params.typeParam] };
    },
    shouldCreateByDemand: true,
  },
  [ChatType.LiveStream]: {
    getSelector(scope: Scope) {
      return {
        metadata: {
          liveStream: Types.ObjectId(scope.params.typeParam),
        },
      };
    },
    getUpdater(scope: Scope) {
      return {
        $set: {
          'metdadata.liveStreamId': scope.params.typeParam,
        },
        $addToSet: {
          participants: scope.user!._id,
        },
      };
    },
  },
};

/**
 * @swagger
 *
 * /chats/{_id}:
 *   get:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Chats
 *     summary: Returns chat by id. Regular users can get only own chats.
 *     operationId: getChat
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns chat by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ChatResponse'
 * /users/{user}/chats:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Chats
 *     summary: Returns array of chats of the specified user.
 *     operationId: getUserChats
 *     parameters:
 *       - in: path
 *         name: user
 *         description: user id, you can use "me" shortcut
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut
 *     responses:
 *       '200':
 *         description: returns user's chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ChatResponseWithUnread'
 * /users/{user}/chats/count:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Chats
 *     summary: Returns count of chats of the specified user
 *     operationId: getUserChatsCount
 *     parameters:
 *       - in: path
 *         name: user
 *         description: user id, you can use "me" shortcut
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut
 *     responses:
 *       '200':
 *         description: returns count of user's chats
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 count:
 *                   type: integer
 * /users/{user}/chats/{chatType}/with/{typeParam}:
 *   put:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Chats
 *     summary: >
 *        Opens chat between user and interlocutor, initiated by user.
 *        If chat does not exist, creates new instance, otherwise returns existing one.
 *     operationId: getUserChat
 *     parameters:
 *       - in: path
 *         name: user
 *         description: ID of user, 'me' placeholder can be used
 *         required: true
 *         schema:
 *           type: string
 *           description: ID of user, 'me' placeholder can be used
 *       - in: path
 *         name: chatType
 *         description: Chat Type
 *         required: true
 *         schema:
 *           type: string
 *           description: Chat Type"&#58;" private, liveStream
 *       - in: path
 *         name: typeParam
 *         description: Chat Type Param
 *         required: true
 *         schema:
 *           type: string
 *           description: >
 *              Chat Type Param"&#58;" private - ID of other user, liveStream - ID of liveStream
 *     responses:
 *       '200':
 *         description: returns new initiated chat
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ChatResponse'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Chats
 *     summary: >
 *        Removes chat between user and interlocutor, initiated by user.
 *        If chat does not exist, creates new instance, otherwise returns existing one.
 *     operationId: deleteUserChat
 *     parameters:
 *       - in: path
 *         name: user
 *         description: ID of user, 'me' placeholder can be used
 *         required: true
 *         schema:
 *           type: string
 *           description: ID of user, 'me' placeholder can be used
 *       - in: path
 *         name: typeParam
 *         description: Chat Type Param
 *         required: true
 *         schema:
 *           type: string
 *           description: >
 *              Chat Type Param"&#58;" private - ID of other user, liveStream - ID of liveStream
 *     responses:
 *       '204':
 *         description: Empty response
 */
class ChatController extends BaseController<
ChatDocument,
Record<string, any>,
ChatResource
> {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: Chat,
        },
      },
      path: ['/chats', '/users/:user/chats'],
      fields: [
        'name',
        'chatType',
        'metadata',
        'participants',
        'messagesCounter',
        'createdAt',
        'updatedAt',
      ],
      readOnlyFields: [
        'chatType',
        'metadata',
        'messagesCounter',
        'createdAt',
        'updatedAt',
      ],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        insert: BaseController.createAction({
          enabled: false,
        }),
        openChat: {
          method: 'put',
          path: ':chatType/with/:typeParam',
        },
        deleteChat: {
          method: 'delete',
          path: ':chatType/with/:typeParam',
        },
      },
      plugins: [
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'user',
          },
        },
      ],
    });
    super(options);
  }

  async pre(scope: Scope<ChatDocument>): Promise<void> {
    const { params: { user }, user: currentUser } = scope;
    if (!currentUser) {
      throw new IllegalStateError('No user');
    }
    if (!currentUser.isAdmin() && user !== currentUser.id) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }
  }

  buildConditions(scope: Scope<ChatDocument>) {
    if (scope.isSelect()) {
      const { params, params: { user } } = scope;
      if (user) {
        params.participants = user;
        delete params.user;
      }
    }
    return super.buildConditions(scope);
  }

  async post(chat: ChatResource, scope: Scope<ChatResource>) {
    if (scope.isSelectOne()) {
      await Chat.countUnreadMessages([chat], scope.user!);
    }
    return chat;
  }

  collectionPost(collection: ChatDocument[], scope: Scope<ChatDocument>) {
    return Chat.countUnreadMessages(collection, scope.user!);
  }

  async openChat(scope: Scope) {
    await this._handlePre(scope);
    const { chatType } = scope.params;
    const chatTypeHandler = chatTypeHandlers[<ChatType>chatType];
    if (!chatTypeHandler) {
      throw HTTP_STATUSES.BAD_REQUEST.createError('Wrong chatType provided');
    }
    const updateObj = chatTypeHandler.getUpdater
      ? chatTypeHandler.getUpdater(scope)
      : chatTypeHandler.getSelector(scope);
    const chat = await Chat.findOneAndUpdate(
      { ...chatTypeHandler.getSelector(scope), chatType },
      { ...updateObj, chatType },
      {
        setDefaultsOnInsert: true,
        new: true,
        upsert: chatTypeHandler.shouldCreateByDemand,
      },
    ).lean();

    if (chat) {
      const socket = scope.getSocket();
      if (socket) {
        socket.join(`chat#${chat._id}`);
      }
    }
    return chat;
  }

  async deleteChat(scope: Scope) {
    await this._handlePre(scope);
    const { chatType } = scope.params;
    const chatTypeHandler = chatTypeHandlers[<ChatType>chatType];
    if (!chatTypeHandler) {
      throw HTTP_STATUSES.BAD_REQUEST.createError('Wrong chatType provided');
    }
    const chat = await Chat.findOne(chatTypeHandler.getSelector(scope));
    if (!chat) {
      throw HTTP_STATUSES.NOT_FOUND.createError();
    }
    const socket = scope.getSocket();
    if (socket) {
      // TODO: Send notifications to the open chats
      socket.leave(`chat#${chat._id}`);
    }
    await chat.remove();
  }
}

export default ChatController;
