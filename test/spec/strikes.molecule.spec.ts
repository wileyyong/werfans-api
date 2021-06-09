import app from 'app';
import { expect } from 'chai';
import specHelper from 'test/helper/specHelper';
import { NotificationDomain } from '../../app/domains/notification';
import { StrikeCreated } from '../../app/domains/molecules';

const {
  consts: { events },
  modelProvider: { Notification },
  moleculerBroker,
  moleculerService,
} = app;

describe('strikes Molecule', () => {
  before(() => moleculerService.startBrokerWithServices(['strikes']));
  after(() => moleculerService.stopBroker());

  specHelper.withAdminUser();
  specHelper.withUser();
  specHelper.withStrike();

  describe('on strike.created', () => {
    let notifications: NotificationDomain[];
    before(() => specHelper.removeAllNotifications());
    before(async function () {
      await specHelper.callMoleculerEventHandler<StrikeCreated>(
        moleculerBroker.getLocalService('strikes'),
        events.strikes.created,
        {
          _id: this.strike._id,
          targetUser: this.user._id,
        },
      );
      notifications = await Notification.find().lean();
    });
    after(() => specHelper.removeAllNotifications());

    it('should create notification', function () {
      expect(notifications.length).to.be.equal(1);
      return specHelper.maskPaths(
        notifications,
        [
          '_id',
          'createdAt',
          'updatedAt',
          'recipients[0]',
          'unread[0]',
          'metadata.strike',
        ],
      ).should.matchSnapshot(this);
    });
  });
});
