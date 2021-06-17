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
const app_1 = __importDefault(require("app"));
const http_status_node_1 = __importDefault(require("http-status-node"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const unread_field_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/unread-field.restdone.plugin"));
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const { modelProvider: { Notification } } = app_1.default;
/**
 * @swagger
 *
 * /notifications/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Notifications
 *     summary: Returns notification by id
 *     operationId: getNotifications
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns notification by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/NotificationModelResponse'
 * /users/{userId}/notifications:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Notifications
 *     summary: Returns array of notifications of the specified user
 *     operationId: getUserNotifications
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: userId, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: userId, 'me' accepted too
 *     responses:
 *       '200':
 *         description: returns users's notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/NotificationModelResponse'
 * /users/{userId}/notifications/{notificationId}:
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Notifications
 *     summary: Marks Notification by notificationId as read
 *     operationId: markReadUserNotification
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: userId, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: userId, 'me' accepted too
 *       - in: path
 *         name: notificationId
 *         description: notification _id
 *         required: true
 *         schema:
 *           type: string
 *           description: notification _id
 *     responses:
 *       '204':
 *         description: Empty response
 */
class NotificationController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: Notification,
                },
            },
            path: '/users/:recipient/notifications',
            fields: [
                'notificationType',
                'readable',
                'body',
                'metadata',
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
            },
            plugins: [
                {
                    plugin: unread_field_restdone_plugin_1.default.restdone,
                    options: {
                        Model: Notification,
                    },
                },
                {
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                    options: {
                        field: 'recipient',
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, params: { recipient } } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isSelect()) {
                throw new Error('Wrong route');
            }
            if (!recipient) {
                params.recipient = currentUser;
            }
            else if (!currentUser.isAdmin() && recipient !== currentUser.id) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
            params.recipients = params.recipient;
            delete params.recipient;
        });
    }
    buildConditions(scope) {
        if (scope.isSelect()) {
            const { params: { recipients } } = scope;
            return { $or: [{ recipients }, { recipients: { $size: 0 } }] };
        }
        else {
            return super.buildConditions(scope);
        }
    }
    getFilter(scope) {
        if (scope.isSelect()) {
            return this.buildConditions(scope);
        }
        else {
            return super.getFilter(scope);
        }
    }
}
module.exports = NotificationController;
//# sourceMappingURL=notification.controller.js.map