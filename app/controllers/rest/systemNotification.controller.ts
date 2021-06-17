import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import { Scope } from '../../domains/app';
import { SystemNotificationDocument, SystemNotificationResource } from '../../domains/systemNotification';

const { modelProvider: { SystemNotification } } = app;

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

class SystemNotificationController extends BaseController<
SystemNotificationDocument,
Record<string, any>,
SystemNotificationResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
      },
    });

    super(options);
  }

  async pre(scope: Scope<SystemNotificationDocument>): Promise<void> {
    const { body } = scope;
    const user = this.getUserStrict(scope);

    if (!user.isAdmin()) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }

    if (scope.isInsert()) {
      body.author = user.id;
      body.sentAt = new Date();
      await app.notificationService.createNotification({
        notificationType: body.notificationType,
        body: 'System Notification',
        metadata: { },
        recipients: [body.recipients],
      });
    }
  }
}

module.exports = SystemNotificationController;
