import app from 'app';
import { EmailBuilder, EmailType, NotificationPayload } from '../../domains/email';

const { config: { app: { title } } } = app;

const email: EmailBuilder<NotificationPayload> = {
  name: EmailType.Notification,
  templateName: 'notification',
  buildData({
    username,
    notificationType,
    notificationBody,
    notificationMetadata,
  }: NotificationPayload) {
    return {
      appName: title,
      name: `${username}`,
      notificationType,
      notificationBody,
      notificationMetadataStr: JSON.stringify(notificationMetadata, undefined, 2),
    };
  },
  buildSubject() {
    return 'New notification';
  },
};

export default email;
