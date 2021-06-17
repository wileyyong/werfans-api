import { expect } from 'chai';
import app from 'app';
import config from 'test/config';
import specHelper from 'test/helper/specHelper';
import { StrikeTargetModel, StrikeType } from '../../app/domains/strike';

import Context = Mocha.Context;

const {
  consts: {
    events,
  },
  modelProvider: {
    Message,
    Strike,
  },
} = app;

const withBannedMessage = (shouldBan: boolean = false) => {
  const chatData = specHelper.getFixture(specHelper.FIXTURE_TYPES.CHAT, 1);
  const bannedMessageData = specHelper.getFixture(specHelper.FIXTURE_TYPES.MESSAGE, 1);
  before('open chat by user', function () {
    this.chat = Object.assign(chatData, { user: this.user._id, typeParam: this.otherUser._id });
    return specHelper.openChat(this.userSocket, this.chat);
  });
  after('remove chat', function () {
    return specHelper.removeChat(this.chat);
  });

  before('create message', function () {
    this.bannedMessage = bannedMessageData;
    return specHelper.createMessage(this.userSocket, this.chat._id, this.bannedMessage);
  });
  if (shouldBan) {
    before(function () {
      return specHelper.banMessage(this.adminUser, this.bannedMessage);
    });
  }
};

const MASKING_FIELDS = ['_id', 'author', 'chat', 'unread[0]', 'createdAt', 'updatedAt'];

describe('Message Ban', () => {
  specHelper.withAdminUser();
  specHelper.withUserSocket({
    key: 'userSocket',
    seed: 1,
    userKey: 'user',
  });
  specHelper.withUserSocket({
    key: 'otherUserSocket',
    seed: 2,
    userKey: 'otherUser',
  });

  describe('Ban message', () => {
    describe('by regular user', () => {
      withBannedMessage();
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseUrl}/messages/${this.bannedMessage._id}/ban`,
            {
              banningReasonType: StrikeType.Spam,
            },
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        403,
      );
    });
    describe('by admin', () => {
      withBannedMessage();
      specHelper.checkMoleculerEventEmit(events.strikes.created, true, {
        mask: ['_id', 'targetUser'],
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${config.baseAdminUrl}/messages/${this.bannedMessage._id}/ban`,
            {
              banningReasonType: StrikeType.Spam,
            },
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        204,
      );
      it('should set banningReasonType', async function () {
        const doc = await Message.findById(this.bannedMessage._id).lean();
        expect(doc.banningReasonType).to.be.equal(StrikeType.Spam);
      });
      it('should create a strike', async function () {
        const strike = await Strike.findOne({ ref: this.bannedMessage._id }).lean();
        expect(strike.refModel).to.be.equal(StrikeTargetModel.Message);
        return expect(specHelper.maskPaths(
          strike,
          [
            '_id',
            'creator',
            'targetUser',
            'ref',
            'createdAt',
            'updatedAt',
          ],
        )).matchSnapshot(this);
      });
    });
  });

  describe('Unban message', () => {
    withBannedMessage(true);
    before(function () {
      return specHelper.unbanMessage(this.bannedMessage);
    });
    it('should reset banningReasonType', async function () {
      const messageDoc = await Message.findById(this.bannedMessage._id).lean();
      return expect(messageDoc.banningReasonType).to.be.undefined;
    });
  });

  describe('Actions with bannedMessage', () => {
    describe('get one', () => {
      describe('with not owner user', () => {
        withBannedMessage(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/chats/${this.chat._id}/messages/${this.bannedMessage._id}`,
              {
                headers: {
                  Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                },
              },
            );
          },
          404,
        );
      });
      describe('with owner user', () => {
        withBannedMessage(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/chats/${this.chat._id}/messages/${this.bannedMessage._id}`,
              {
                headers: {
                  Authorization: `Bearer ${this.user.auth.access_token}`,
                },
              },
            );
          },
          200,
        );
      });
      describe('with admin user', () => {
        withBannedMessage(true);
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${config.baseUrl}/admin/messages/${this.bannedMessage._id}`,
              {
                headers: {
                  Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                },
              },
            );
          },
          200,
        );
      });
    });
    describe('get list', () => {
      withBannedMessage(true);
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/chats/${this.chat._id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${this.otherUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          description: 'should not contain banned item',
          mask: ['_id', 'createdAt', 'updatedAt'],
        },
      );
    });
  });

  describe('Actions with unbannedMessage', () => {
    describe('get one', () => {
      withBannedMessage(true);
      before(function () {
        return specHelper.unbanMessage(this.bannedMessage);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/chats/${this.chat._id}/messages/${this.bannedMessage._id}`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
      );
    });
    describe('get list', () => {
      withBannedMessage(true);
      before(function () {
        return specHelper.unbanMessage(this.bannedMessage);
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${config.baseUrl}/chats/${this.chat._id}/messages`,
            {
              headers: {
                Authorization: `Bearer ${this.otherUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          description: 'should contain banned item',
          mask: MASKING_FIELDS,
        },
      );
    });
  });
});
