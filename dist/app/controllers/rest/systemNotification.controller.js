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
const { modelProvider: { SystemNotification } } = app_1.default;
/**
 * @swagger
 *
 * /system-notifications:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Notifications
 *     summary: Returns array of system notifications (admins only)
 *     operationId: getSystemNotifications
 *     responses:
 *       '200':
 *         description: returns users's notifications
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/SystemNotificationModelList'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Notifications
 *     summary: Returns created system notification (admins only)
 *     operationId: createSystemNotification
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationType:
 *                 type: string
 *             required:
 *               - notificationType
 *     responses:
 *       '200':
 *         description: returns created system notification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/SystemNotificationModel'
 * /system-notifications/{notificationId}:
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Notifications
 *     summary: Updates system notification by notificationId (admins only)
 *     operationId: updateSystemNotification
 *     parameters:
 *       - in: path
 *         name: notificationId
 *         description: notification _id
 *         required: true
 *         schema:
 *           type: string
 *           description: notification _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               notificationType:
 *                 type: string
 *             required:
 *               - notificationType
 *     responses:
 *       '200':
 *         description: returns updated SystemNotification
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/SystemNotificationModelList'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Notifications
 *     summary: Removes system notification by notificationId (admins only)
 *     operationId: removeSystemNotification
 *     parameters:
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
class SystemNotificationController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: SystemNotification,
                },
            },
            path: '/system-notifications',
            fields: [
                'notificationType',
                {
                    name: 'author',
                    fields: ['username'],
                },
                'sentAt',
                'createdAt',
                'updatedAt',
            ],
            readOnlyFields: ['sentAt', 'createdAt', 'updatedAt'],
            actions: {
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
            },
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = scope;
            const user = this.getUserStrict(scope);
            if (!user.isAdmin()) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
            if (scope.isInsert()) {
                body.author = user.id;
                body.sentAt = new Date();
                yield app_1.default.notificationService.createNotification({
                    notificationType: body.notificationType,
                    body: 'System Notification',
                    metadata: {},
                    recipients: [body.recipients],
                });
            }
        });
    }
}
module.exports = SystemNotificationController;
//# sourceMappingURL=systemNotification.controller.js.map