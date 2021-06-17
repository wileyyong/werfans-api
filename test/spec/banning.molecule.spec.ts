import app from 'app';
import { expect } from 'chai';
import specHelper from 'test/helper/specHelper';
import { StrikeCreated, StrikeRevoked } from '../../app/domains/molecules';
import { StrikeState, StrikeTargetModel } from '../../app/domains/strike';
import { BanningReasonType } from '../../app/domains/banning';

const {
  config: { banningStrategy: { strikeThreshold } },
  consts: { events },
  moleculerBroker,
  moleculerService,
  modelProvider: {
    Album,
    Strike,
    User,
  },
} = app;

describe('banning Molecule', () => {
  describe('on strike.created', () => {
    specHelper.withAdminUser();

    specHelper.withUser({
      key: 'otherUser',
    });
    specHelper.withStrike({
      targetUserKey: 'otherUser',
    });

    const prepareUser = (strikeNumber: number) => {
      specHelper.withUser();
      for (let i = 0; i < strikeNumber; i += 1) {
        specHelper.withStrike();
      }
    };

    const checkBan = function (shouldBan: boolean) {
      it(shouldBan ? 'should ban' : 'should not ban', async function () {
        const user = await User.findById(this.user._id);
        return shouldBan
          ? expect(user!.suspendedAt).not.to.be.undefined
            && expect(user!.banningReasonType).to.be.equal(BanningReasonType.ByStrikes)
          : expect(user!.suspendedAt).to.be.undefined
            && expect(user!.banningReasonType).to.be.undefined;
      });
    };

    const callEventHandler = () => {
      before(() => moleculerService.startBrokerWithServices(['banning']));
      after(() => moleculerService.stopBroker());
      before(async function () {
        await specHelper.callMoleculerEventHandler<StrikeCreated>(
          moleculerBroker.getLocalService('banning'),
          events.strikes.created,
          {
            _id: this.strike._id,
            targetUser: this.user._id,
          },
        );
      });
    };
    describe('not enough strikes', () => {
      prepareUser(strikeThreshold - 1);
      callEventHandler();
      checkBan(false);
    });
    describe('not enough strikes in right state', () => {
      prepareUser(strikeThreshold);
      before('make last strike revoked', function () {
        return Strike.updateOne({ _id: this.strike._id }, { state: StrikeState.Revoked });
      });
      callEventHandler();
      checkBan(false);
    });
    describe('enough strikes', () => {
      prepareUser(strikeThreshold);
      callEventHandler();
      checkBan(true);
    });
    describe('extra strikes in right state', () => {
      prepareUser(strikeThreshold + 1);
      callEventHandler();
      checkBan(true);
    });
  });

  describe('on strike.revoked', () => {
    specHelper.withAdminUser();

    specHelper.withUser({
      key: 'otherUser',
    });
    specHelper.withStrike({
      targetUserKey: 'otherUser',
    });

    const prepareUser = (strikeNumber: number, banningReasonType?: BanningReasonType) => {
      specHelper.withUser();
      for (let i = 0; i < strikeNumber; i += 1) {
        specHelper.withAlbum({
          key: `album${i}`,
        });
        before(async function () {
          await specHelper.banAlbum(this.adminUser, this[`album${i}`]);
          if (i === strikeNumber - 1) {
            this.strike = await Strike.findOne({ ref: this[`album${i}`]._id }).lean();
            this.album = this[`album${i}`];
          }
        });
      }
      if (banningReasonType) {
        before(function () {
          return User.ban(this.user._id, { banningReasonType });
        });
      }
    };

    const checkUserBan = function (shouldBan: boolean) {
      it(shouldBan ? 'should keep user banned' : 'should unban user', async function () {
        const user = await User.findById(this.user._id);
        return shouldBan
          ? expect(user!.suspendedAt).not.to.be.undefined
          : expect(user!.suspendedAt).to.be.undefined;
      });
    };

    const checkAlbumBan = function (shouldBan: boolean) {
      it(shouldBan ? 'album should keep ban' : 'album should unban', async function () {
        const album = await Album.findById(this.album._id);
        return shouldBan
          ? expect(album!.suspendedAt).not.to.be.undefined
          : expect(album!.suspendedAt).to.be.undefined;
      });
    };

    const callEventHandler = () => {
      before(() => moleculerService.startBrokerWithServices(['banning']));
      after(() => moleculerService.stopBroker());
      before(async function () {
        await specHelper.callMoleculerEventHandler<StrikeRevoked>(
          moleculerBroker.getLocalService('banning'),
          events.strikes.revoked,
          {
            _id: this.strike._id,
            targetUser: this.user._id,
            ref: this.album._id,
            refModel: StrikeTargetModel.Album,
          },
        );
      });
    };
    describe('1 strike', () => {
      prepareUser(1, BanningReasonType.ByStrikes);
      callEventHandler();
      checkAlbumBan(false);
      checkUserBan(false);
    });
    describe('lower strikeThreshold', () => {
      describe('ByStrikes', () => {
        prepareUser(strikeThreshold - 1, BanningReasonType.ByStrikes);
        callEventHandler();
        checkAlbumBan(false);
        checkUserBan(false);
      });
      describe('ByAdmin', () => {
        prepareUser(strikeThreshold - 1, BanningReasonType.ByAdmin);
        callEventHandler();
        checkAlbumBan(false);
        checkUserBan(true);
      });
    });
    describe('still a lot of strikes', () => {
      prepareUser(strikeThreshold, BanningReasonType.ByStrikes);
      callEventHandler();
      checkAlbumBan(false);
      checkUserBan(true);
    });
  });
});
