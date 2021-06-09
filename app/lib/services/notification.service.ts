import _ from 'lodash';
import app from 'app';
import SocketIORedis from 'socket.io-redis';
import { NotificationDocument, NotificationDomain, Signal } from '../../domains/notification';
import fromCallback from '../helpers/fromCallback';
import { EmailType, NotificationPayload } from '../../domains/email';

const { modelProvider: { Notification, User } } = app;

export class NotificationService {
  async init(): Promise<void> {
    app.registerProvider('notificationService', this);
  }

  async createNotification<M>(
    notificationData: Omit<NotificationDomain, 'readable' | 'unread' | 'createdAt' | 'updatedAt'>,
  ): Promise<NotificationDocument<M> | null> {
    const { recipients: originalRecipients } = notificationData;
    const { emailRecipients, inAppRecipients } = await User.applyNotificationConfigsRules(
      originalRecipients || [],
    );
    const isGlobal = !Array.isArray(originalRecipients);
    const readable = !isGlobal;
    const unread = inAppRecipients;

    // no recipients for notification
    if (!isGlobal && emailRecipients.length === 0 && inAppRecipients.length === 0) {
      return null;
    }

    const notification = <NotificationDocument<M>>(
      await Notification.create({ ...notificationData, readable, unread })
    );
    if (isGlobal) {
      app.sio.sockets
        .to('global-notifications')
        .emit('new-global-notification', { data: notification });
    } else {
      const onlineUserIds: string[] = [];
      await Promise.all((inAppRecipients).map(async (userId) => {
        const roomId = `user-notifications-#${userId}`;
        const roomClients: string[] = await fromCallback((callback) => (
          (<SocketIORedis.RedisAdapter>app.sio.of('/').adapter).clients([roomId], callback)
        ));
        if (roomClients.length) {
          app.sio.sockets
            .to(roomId)
            .emit('new-user-notification', { data: notification });
          onlineUserIds.push(userId);
        }
      }));
      const adjustedEmailRecipients = _.difference(emailRecipients, onlineUserIds);
      const userEmails = await User.getEmails(adjustedEmailRecipients, 'username');
      await Promise.all(userEmails.map(({ email, username }) => (
        app.emailService.sendEmail<NotificationPayload>(
          EmailType.Notification,
          {
            email,
            payload: {
              username,
              notificationType: notification.notificationType,
              notificationBody: notification.body,
              notificationMetadata: notification.metadata,
            },
          },
        )
      )));
    }

    return notification;
  }

  createSignal<T>(
    signal: Signal<T>,
  ): void {
    const isGlobal = !Array.isArray(signal.recipients);

    // no recipients for notification
    if (!isGlobal && (<string[]>signal.recipients).length === 0) {
      return;
    }

    if (isGlobal) {
      app.sio.sockets
        .to('global-notifications')
        .emit('new-global-signal', { data: signal });
    } else {
      (<string[]>signal.recipients).forEach((userId) => {
        app.sio.sockets
          .to(`user-notifications-#${userId}`)
          .emit('new-user-signal', { data: signal });
      });
    }
  }
}

const notificationService = new NotificationService();

export default notificationService;
