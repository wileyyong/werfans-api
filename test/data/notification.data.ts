import { NotificationType } from '../../app/domains/notification';

export = module.exports = () => ({
  notificationType: NotificationType.Testing,
  body: 'notification body',
});
