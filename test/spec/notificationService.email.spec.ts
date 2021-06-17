import { expect } from 'chai';
import app from 'app';
import specHelper from 'test/helper/specHelper';
import { NotificationDocument, NotificationType } from '../../app/domains/notification';

const { modelProvider: { User } } = app;

describe('Notification Service Email', () => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);

  specHelper.withUser({
    data: userData,
    key: 'user',
  });

  describe('Send user notification', () => {
    describe('when NOT isEmailMuted', () => {
      let notification: NotificationDocument | null;
      let emails: any[];
      before(() => specHelper.fetchAndClearSentEmails());
      before(async function () {
        notification = await app.notificationService.createNotification({
          notificationType: NotificationType.Testing,
          body: 'test',
          recipients: [this.user._id],
          metadata: {
            field: 'value',
          },
        });
      });
      before(async () => {
        emails = await specHelper.fetchAndClearSentEmails();
      });

      after('remove notification', () => specHelper.removeNotification(notification!));

      it('should receive email', function () {
        return expect(emails).to.matchSnapshot(this);
      });
    });

    describe('when isEmailMuted', () => {
      let notification: NotificationDocument | null;
      let emails: any[];
      before('mute email notifications', function () {
        return User.updateOne(
          { _id: this.user._id },
          { 'notificationSettings.isEmailMuted': true },
        );
      });
      after('unmute email notifications', function () {
        return User.updateOne(
          { _id: this.user._id },
          { $unset: { isEmailMuted: 1 } },
        );
      });
      before(() => specHelper.fetchAndClearSentEmails());
      before(async function () {
        notification = await app.notificationService.createNotification({
          notificationType: NotificationType.Testing,
          body: 'test',
          recipients: [this.user._id],
          metadata: {
            field: 'value',
          },
        });
      });
      before(async () => {
        emails = await specHelper.fetchAndClearSentEmails();
      });

      after('remove notification', () => specHelper.removeNotification(notification!));

      it('should not receive email', () => expect(emails.length).to.be.equal(0));
    });
  });
});
