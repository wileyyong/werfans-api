"use strict";
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
const app_1 = __importDefault(require("app"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const unread_field_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/unread-field.restdone.plugin"));
const banContent_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/banContent.restdone.plugin"));
const notification_1 = require("../../domains/notification");
const exceptions_1 = require("../../lib/helpers/exceptions");
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const { modelProvider: { Chat, Message }, } = app_1.default;
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
class MessageController extends base_restdone_controller_1.default {
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
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
            },
            plugins: [
                {
                    plugin: unread_field_restdone_plugin_1.default.restdone,
                    options: {
                        Model: Message,
                        afterRemove(scope) {
                            const { params: { _id: id, chat: chatId } } = scope;
                            const socket = scope.getSocket();
                            if (socket) {
                                socket.broadcast
                                    .to(`chat#${chatId}`)
                                    .emit(`chat#${chatId}-read-message`, { data: { message: { _id: id } } });
                            }
                        },
                        afterRemoveAll(scope) {
                            const { params: { chat: chatId } } = scope;
                            const socket = scope.getSocket();
                            if (socket) {
                                socket.broadcast
                                    .to(`chat#${chatId}`)
                                    .emit(`chat#${chatId}-read-chat`, { data: {} });
                            }
                        },
                    },
                },
                {
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
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
                    plugin: banContent_restdone_plugin_1.default.restdone,
                    options: {
                        Model: Message,
                        targetUserFieldName: 'author',
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { context, params, params: { chat }, user: currentUser } = scope;
            let { params: { author } } = scope;
            if (!currentUser) {
                throw new exceptions_1.IllegalStateError('No user');
            }
            if (!author) {
                author = currentUser.id;
                if (!scope.isSelect()) {
                    params.author = author;
                }
            }
            else if (!scope.isAdminMode && author !== currentUser.id) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
            if (!scope.isAdminMode) {
                const chatDoc = yield Chat
                    .findOne({ _id: chat, participants: author }).select('participants').lean();
                if (!chatDoc) {
                    throw http_status_node_1.default.BAD_REQUEST.createError(`Wrong chat: ${chat}`);
                }
                context.chat = chatDoc;
            }
            if (!scope.isAdminMode) {
                params.$or = [{ suspendedAt: { $exists: false } }, { author: currentUser._id }];
            }
        });
    }
    beforeSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { model, context: { chat: { participants } } } = scope;
            model.unread = participants.filter((userId) => !userId.equals(model.author));
        });
    }
    afterSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { model: message, context: { chat } } = scope;
            const socket = scope.getSocket();
            if (scope.isInsert()) {
                yield app_1.default.notificationService.createNotification({
                    notificationType: notification_1.NotificationType.PrivateMessageReceived,
                    body: 'Private message received',
                    metadata: {
                        chat: chat._id,
                    },
                    recipients: chat.participants
                        .filter((participant) => !message.author.equals(participant)),
                });
                if (socket) {
                    socket.broadcast
                        .to(`chat#${chat._id}`)
                        .emit(`chat#${chat._id}-new-message`, { data: { message } });
                }
            }
            else if (scope.isUpdate() && socket) {
                socket.broadcast
                    .to(`chat#${chat._id}`)
                    .emit(`chat#${chat._id}-update-message`, { data: { message } });
            }
        });
    }
}
module.exports = MessageController;
//# sourceMappingURL=message.controller.js.map