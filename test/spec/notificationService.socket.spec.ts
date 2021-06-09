import { expect } from 'chai';
import app from 'app';
import specHelper from 'test/helper/specHelper';
import { NotificationDocument, NotificationType } from '../../app/domains/notification';

const { modelProvider: { User } } = app;

const MASKING_FIELD = [
  'data._id',
  'data.recipients',
  'data.unread',
  'data.createdAt',
  'data.updatedAt',
];

describe('Notification Service Socket', () => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const otherUserData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);

  specHelper.withUserSocket({
    data: userData,
    userKey: 'user',
    key: 'userSocket',
  });

  specHelper.withUserSocket({
    data: otherUserData,
    userKey: 'otherUser',
    key: 'otherUserSocket',
  });

  describe('Send user notification', () => {
    describe('when NOT isInAppMuted', () => {
      let notification: NotificationDocument | null;
      let emails: any[];
      specHelper.withSocketHandler({
        key: 'userSocket',
        eventName: 'new-user-notification',
        makeSnapShot: {
          mask: MASKING_FIELD,
          isForced: true,
        },
      });
      specHelper.withSocketHandler({
        key: 'otherUserSocket',
        eventName: 'new-user-notification',
        shouldBeSilent: true,
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

      it('notification should have the same _id', function () {
        return expect(notification!._id.toString()).to.be.equal(this.socketEventData.data._id);
      });

      it('should not send email', () => expect(emails.length).to.be.equal(0));
    });

    describe('when isInAppMuted', () => {
      let notification: NotificationDocument | null;
      let emails: any[];
      before('mute inApp notifications', function () {
        return User.updateOne(
          { _id: this.user._id },
          { 'notificationSettings.isInAppMuted': true },
        );
      });
      after('unmute inApp notifications', function () {
        return User.updateOne(
          { _id: this.user._id },
          { $unset: { notificationSettings: 1 } },
        );
      });
      specHelper.withSocketHandler({
        key: 'userSocket',
        eventName: 'new-user-notification',
        shouldBeSilent: true,
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

      it('should send email', () => expect(emails.length).to.be.equal(1));
    });
  });

  describe('Send global notification', () => {
    let notification: NotificationDocument | null;
    specHelper.withSocketHandler({
      key: 'userSocket',
      eventName: 'new-global-notification',
      makeSnapShot: {
        mask: MASKING_FIELD,
      },
    });
    specHelper.withSocketHandler({
      key: 'otherUserSocket',
      eventName: 'new-global-notification',
    });
    before(async () => {
      notification = await app.notificationService.createNotification({
        notificationType: NotificationType.Testing,
        body: 'test',
        metadata: {
          field: 'value',
        },
      });
    });

    after('remove notification', () => specHelper.removeNotification(notification!));

    it('notification should have the same _id', function () {
      return expect(notification!._id.toString()).to.be.equal(this.socketEventData.data._id);
    });
  });
});
