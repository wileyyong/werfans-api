import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import unreadFieldPlugin from 'app/lib/restdone.plugin/unread-field.restdone.plugin';
import { Scope } from '../../domains/app';
import { NotificationDocument, NotificationResource } from '../../domains/notification';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';

const { modelProvider: { Notification } } = app;

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

class NotificationController extends BaseController<
NotificationDocument,
Record<string, any>,
NotificationResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        insert: BaseController.createAction({
          enabled: false,
        }),
      },
      plugins: [
        {
          plugin: unreadFieldPlugin.restdone,
          options: {
            Model: Notification,
          },
        },
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'recipient',
          },
        },
      ],
    });

    super(options);
  }

  async pre(scope: Scope<NotificationDocument>): Promise<void> {
    const { params, params: { recipient } } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isSelect()) {
      throw new Error('Wrong route');
    }

    if (!recipient) {
      params.recipient = currentUser;
    } else if (!currentUser.isAdmin() && recipient !== currentUser.id) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }

    params.recipients = params.recipient;
    delete params.recipient;
  }

  buildConditions(scope: Scope<NotificationDocument>): Record<string, any> {
    if (scope.isSelect()) {
      const { params: { recipients } } = scope;
      return { $or: [{ recipients }, { recipients: { $size: 0 } }] };
    } else {
      return super.buildConditions(scope);
    }
  }

  getFilter(scope: Scope<NotificationDocument>): Record<string, any> {
    if (scope.isSelect()) {
      return this.buildConditions(scope);
    } else {
      return super.getFilter(scope);
    }
  }
}

module.exports = NotificationController;
