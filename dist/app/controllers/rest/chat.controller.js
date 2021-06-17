"use strict";
/**
 * Created by mk on 11/23/15.
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_node_1 = __importDefault(require("http-status-node"));
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("app"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const chat_1 = require("../../domains/chat");
const exceptions_1 = require("../../lib/helpers/exceptions");
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const { modelProvider: { Chat } } = app_1.default;
const chatTypeHandlers = {
    [chat_1.ChatType.Private]: {
        getSelector(scope) {
            const userId = mongoose_1.Types.ObjectId(scope.user._id);
            const otherUserId = mongoose_1.Types.ObjectId(scope.params.typeParam);
            if (userId.equals(otherUserId)) {
                throw http_status_node_1.default.BAD_REQUEST.createError('Wrong interlocutor');
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
        getUpdater(scope) {
            return { participants: [scope.user._id, scope.params.typeParam] };
        },
        shouldCreateByDemand: true,
    },
    [chat_1.ChatType.LiveStream]: {
        getSelector(scope) {
            return {
                metadata: {
                    liveStream: mongoose_1.Types.ObjectId(scope.params.typeParam),
                },
            };
        },
        getUpdater(scope) {
            return {
                $set: {
                    'metdadata.liveStreamId': scope.params.typeParam,
                },
                $addToSet: {
                    participants: scope.user._id,
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
class ChatController extends base_restdone_controller_1.default {
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
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
                insert: base_restdone_controller_1.default.createAction({
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
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                    options: {
                        field: 'user',
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params: { user }, user: currentUser } = scope;
            if (!currentUser) {
                throw new exceptions_1.IllegalStateError('No user');
            }
            if (!currentUser.isAdmin() && user !== currentUser.id) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
        });
    }
    buildConditions(scope) {
        if (scope.isSelect()) {
            const { params, params: { user } } = scope;
            if (user) {
                params.participants = user;
                delete params.user;
            }
        }
        return super.buildConditions(scope);
    }
    // async post(chat: ChatDocument, scope: Scope<ChatResource>) {
    //   if (scope.isSelectOne()) {
    //     await Chat.countUnreadMessages([chat], scope.user!);
    //   }
    //   return chat;
    // }
    // collectionPost(collection: ChatDocument[], scope: Scope<ChatDocument>) {
    //   return Chat.countUnreadMessages(collection, scope.user!);
    // }
    openChat(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._handlePre(scope);
            const { chatType } = scope.params;
            const chatTypeHandler = chatTypeHandlers[chatType];
            if (!chatTypeHandler) {
                throw http_status_node_1.default.BAD_REQUEST.createError('Wrong chatType provided');
            }
            const updateObj = chatTypeHandler.getUpdater
                ? chatTypeHandler.getUpdater(scope)
                : chatTypeHandler.getSelector(scope);
            const chat = yield Chat.findOneAndUpdate(Object.assign(Object.assign({}, chatTypeHandler.getSelector(scope)), { chatType }), Object.assign(Object.assign({}, updateObj), { chatType }), {
                setDefaultsOnInsert: true,
                new: true,
                upsert: chatTypeHandler.shouldCreateByDemand,
            }).lean();
            if (chat) {
                const socket = scope.getSocket();
                if (socket) {
                    socket.join(`chat#${chat._id}`);
                }
            }
            return chat;
        });
    }
    deleteChat(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._handlePre(scope);
            const { chatType } = scope.params;
            const chatTypeHandler = chatTypeHandlers[chatType];
            if (!chatTypeHandler) {
                throw http_status_node_1.default.BAD_REQUEST.createError('Wrong chatType provided');
            }
            const chat = yield Chat.findOne(chatTypeHandler.getSelector(scope));
            if (!chat) {
                throw http_status_node_1.default.NOT_FOUND.createError();
            }
            const socket = scope.getSocket();
            if (socket) {
                // TODO: Send notifications to the open chats
                socket.leave(`chat#${chat._id}`);
            }
            yield chat.remove();
        });
    }
}
exports.default = ChatController;
//# sourceMappingURL=chat.controller.js.map