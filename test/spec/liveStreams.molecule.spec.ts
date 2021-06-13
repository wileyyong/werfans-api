import moment from 'moment';
import app from 'app';
import { expect } from 'chai';
import specHelper from 'test/helper/specHelper';
import { NotificationDomain } from '../../app/domains/notification';
import { LiveStreamDocument } from '../../app/domains/liveStream';
import Context = Mocha.Context;

const { modelProvider: { LiveStream, Notification }, moleculerBroker, moleculerService } = app;

function fetchLiveStream(liveStreamId: string) {
  return LiveStream
    .findById(liveStreamId)
    .select('startingProcessedAt')
    .lean()!;
}

function updateLiveStream(liveStreamId: string, scheduledStartingAt: string) {
  return LiveStream
    .updateOne(
      {
        _id: liveStreamId,
      },
      {
        scheduledStartingAt,
      },
    );
}

describe('liveStreams Molecule', () => {
  before(() => moleculerService.startBrokerWithServices(['liveStreams']));
  after(() => moleculerService.stopBroker());

  specHelper.withUser({
    key: 'user',
    seed: 1,
  });

  specHelper.withUser({
    key: 'subscriberUser',
    seed: 2,
  });

  specHelper.withUser({
    key: 'notSubscriberUser',
    seed: 3,
  });

  before(function () {
    return specHelper.addUserSubscribers(this.user, this.subscriberUser);
  });

  describe('#checkScheduled', () => {
    describe('not scheduled liveStream', () => {
      let liveStream: LiveStreamDocument;
      specHelper.withLiveStream({
        seed: 1,
      });
      before(async function (this: Context) {
        await moleculerBroker.getLocalService('liveStreams').checkScheduled();
        liveStream = await fetchLiveStream(this.liveStream._id);
      });

      it('should not set startingProcessedAt', () => expect(liveStream.startingProcessedAt).to.be.undefined);
    });

    describe('scheduled in the past liveStream', () => {
      let liveStream: LiveStreamDocument;
      let notifications: NotificationDomain[];
      specHelper.withLiveStream({
        seed: 1,
      });
      before(() => specHelper.removeAllNotifications());
      before(async function (this: Context) {
        const scheduledStartingAt = moment().subtract(2, 'hours').toISOString();
        await updateLiveStream(this.liveStream._id, scheduledStartingAt);
        await moleculerBroker.getLocalService('liveStreams').checkScheduled();
        liveStream = await fetchLiveStream(this.liveStream._id);
      });
      before(async () => {
        notifications = await Notification.find().lean();
      });
      after(() => specHelper.removeAllNotifications());

      it('should set startingProcessedAt', () => expect(liveStream.startingProcessedAt).not.to.be.undefined);
      it('should create notification', function () {
        return specHelper.maskPaths(
          notifications,
          [
            '_id',
            'createdAt',
            'updatedAt',
            'recipients[0]',
            'unread[0]',
            'metadata.liveStream',
            'metadata.owner',
          ],
        ).should.matchSnapshot(this);
      });
    });

    describe('scheduled in the future liveStream', () => {
      let liveStream: LiveStreamDocument;
      specHelper.withLiveStream({
        seed: 1,
      });
      before(async function (this: Context) {
        const scheduledStartingAt = moment().add(2, 'hours').toISOString();
        await updateLiveStream(this.liveStream._id, scheduledStartingAt);
        await moleculerBroker.getLocalService('liveStreams').checkScheduled();
        liveStream = await fetchLiveStream(this.liveStream._id);
      });

      it('should not set startingProcessedAt', () => expect(liveStream.startingProcessedAt).to.be.undefined);
    });
  });
});
