/**
 * Created by mk on 08/07/16.
 */

import chai from 'chai';
import app from 'app';
import specHelper from 'test/helper/specHelper';
import { Context } from 'mocha';
import { NotificationDocument, NotificationDomain } from '../../app/domains/notification';

const { expect } = chai;

describe('Notification Unread', () => {
  const userNotification: Partial<NotificationDomain> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.NOTIFICATION,
  );
  const globalNotification: Partial<NotificationDomain> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.NOTIFICATION,
  );

  specHelper.withUserSocket();
  specHelper.withUser({
    key: 'otherUser',
  });

  describe('Get initial unread notifications', () => {
    let notificationsList;
    let notificationsList2;

    before('get notifications', async function () {
      notificationsList = await specHelper.getNotifications(this.user);
      notificationsList2 = await specHelper.getNotifications(this.otherUser);
    });
    it('initial notifications should be equal 0',
      () => {
        expect(notificationsList.length).to.be.equal(0);
        expect(notificationsList2.length).to.be.equal(0);
      });
  });

  describe('Create notification', () => {
    let userNotifications;
    let otherUserNotifications;

    before('create notification', function () {
      return specHelper.createNotification(userNotification, [this.user]);
    });
    before('create notification', () => specHelper.createNotification(globalNotification, []));
    before('get notifications for user', async function () {
      userNotifications = await specHelper.getNotifications(this.user);
    });
    before('getx notification for otherUser', async function () {
      otherUserNotifications = await specHelper.getNotifications(this.otherUser);
    });
    after('remove notifications', async () => {
      await specHelper.removeNotification(userNotification);
      await specHelper.removeNotification(globalNotification);
    });
    it('userNotifications.length for user should be equal 2',
      () => expect(userNotifications.length).to.be.equal(2));
    it('otherUserNotifications.length for otherUser should be equal 1',
      () => expect(otherUserNotifications.length).to.be.equal(1));
  });

  describe('Mark userNotification as read', () => {
    let isNotificationCame: boolean;
    let notificationId: string;
    let notification: NotificationDocument | null;

    before('wait notification', function () {
      this.userSocket.once('new-user-notification', (data: any) => {
        isNotificationCame = true;
        notificationId = data.data._id;
      });
    });

    before('create user notification', async function () {
      await app.notificationService.createNotification(<NotificationDomain>{
        ...userNotification,
        recipients: [this.user._id],
      });
    });

    before(() => specHelper.waitFor(() => isNotificationCame));

    specHelper.checkSocketResponse(
      'userSocket',
      function (this: Context) {
        return {
          route: 'delete:/users/:recipient/notifications/:_id/unread',
          params: {
            recipient: this.user._id,
            _id: notificationId,
          },
        };
      },
      204,
    );

    before('get userNotification', async () => {
      notification = await specHelper.getNotificationFromDb({ _id: notificationId });
    });
    it('length of unread for userNotification should be 0',
      () => expect(notification!.unread!.length).to.be.equal(0));
  });

  after('remove globalNotification', () => specHelper.removeNotification(globalNotification));
  after('remove userNotification', () => specHelper.removeNotification(userNotification));
});
