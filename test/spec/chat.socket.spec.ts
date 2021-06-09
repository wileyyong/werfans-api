/**
 * Created by mk on 08/07/16.
 */

import { Types } from 'mongoose';
import { expect } from 'chai';
import specHelper from 'test/helper/specHelper';
import { ChatType } from '../../app/domains/chat';

import Context = Mocha.Context;

const CHAT_MASKED_FIELDS = [
  '_id',
  'participants',
  'createdAt',
  'updatedAt',
];

const withUsers = () => {
  specHelper.withUserSocket({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
    key: 'userSocket',
    userKey: 'user',
  });

  specHelper.withUserSocket({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
    key: 'otherUserSocket',
    userKey: 'otherUser',
  });
};

describe('Chat Socket', () => {
  describe(`type ${ChatType.Private}`, () => {
    describe('Remove not existing chat', () => {
      withUsers();
      specHelper.checkSocketResponse(
        'userSocket',
        function (this: Context) {
          return {
            route: 'delete:/chats/:chatType/with/:typeParam',
            params: {
              chatType: ChatType.Private,
              user: this.user._id,
              typeParam: this.otherUser._id,
            },
          };
        },
        404,
      );
    });
    describe('Open chat 1st time by user', () => {
      withUsers();
      specHelper.checkSocketResponse(
        'userSocket',
        function (this: Context) {
          return {
            route: 'put:/chats/:chatType/with/:typeParam',
            params: {
              chatType: ChatType.Private,
              user: this.user._id,
              typeParam: this.otherUser._id,
            },
          };
        },
        200,
        {
          makeSnapShot: {
            mask: CHAT_MASKED_FIELDS,
          },
        },
      );
      after(function () {
        return specHelper.removeChat(this.response.body);
      });
    });

    describe('Open chat 2nd time by user', () => {
      withUsers();
      specHelper.withChat();
      specHelper.checkSocketResponse(
        'userSocket',
        function (this: Context) {
          return {
            route: 'put:/chats/:chatType/with/:typeParam',
            params: {
              chatType: ChatType.Private,
              user: this.user._id,
              typeParam: this.otherUser._id,
            },
          };
        },
        200,
        {
          makeSnapShot: {
            mask: CHAT_MASKED_FIELDS,
          },
        },
      );
      it('_id should be the same _id', function () {
        return expect(this.response.body._id).to.be.equal(this.chat._id);
      });
    });

    describe('Open chat by otherUser', () => {
      withUsers();
      specHelper.withChat();
      specHelper.checkSocketResponse(
        'otherUserSocket',
        function (this: Context) {
          return {
            route: 'put:/chats/:chatType/with/:typeParam',
            params: {
              chatType: ChatType.Private,
              user: this.otherUser._id,
              typeParam: this.user._id,
            },
          };
        },
        200,
        {
          makeSnapShot: {
            mask: CHAT_MASKED_FIELDS,
          },
        },
      );
      it('_id should be the same _id', function () {
        return expect(this.response.body._id).to.be.equal(this.chat._id);
      });
    });

    describe('Get chats', () => {
      withUsers();
      specHelper.withChat();
      specHelper.checkSocketResponse(
        'userSocket',
        () => ({
          route: 'get:/chats',
          params: { user: 'me' },
        }),
        200,
        {
          makeSnapShot: {
            mask: CHAT_MASKED_FIELDS,
          },
        },
      );
      it('_id should contain the same _id', function () {
        return expect(this.response.body[0]._id).to.be.equal(this.chat._id);
      });
    });

    describe('Get chats count', () => {
      withUsers();
      specHelper.withChat();
      specHelper.checkSocketResponse(
        'userSocket',
        () => ({
          route: 'get:/chats/count',
          params: { user: 'me' },
        }),
        200,
        {
          makeSnapShot: {
            mask: CHAT_MASKED_FIELDS,
          },
        },
      );
    });

    describe('Remove chat', () => {
      withUsers();
      specHelper.withChat();
      specHelper.checkSocketResponse(
        'userSocket',
        function (this: Context) {
          return {
            route: 'delete:/chats/:chatType/with/:typeParam',
            params: {
              chatType: ChatType.Private,
              user: this.user._id,
              typeParam: this.otherUser._id,
            },
          };
        },
        204,
      );
    });
  });

  describe(`type ${ChatType.LiveStream}`, () => {
    const chatType = ChatType.LiveStream;
    describe('chat does not exist', () => {
      const liveStreamId = new Types.ObjectId();
      withUsers();
      specHelper.checkSocketResponse(
        'userSocket',
        function (this: Context) {
          return {
            route: 'put:/chats/:chatType/with/:typeParam',
            params: {
              chatType,
              user: this.user._id,
              typeParam: liveStreamId,
            },
          };
        },
        200,
        {
          makeSnapShot: {
            description: 'should be null',
          },
        },
      );
    });

    describe('chat exists', () => {
      withUsers();
      specHelper.withLiveStream();
      specHelper.checkSocketResponse(
        'userSocket',
        function (this: Context) {
          return {
            route: 'put:/chats/:chatType/with/:typeParam',
            params: {
              chatType,
              user: this.user._id,
              typeParam: this.liveStream._id,
            },
          };
        },
        200,
        {
          makeSnapShot: {
            mask: [...CHAT_MASKED_FIELDS, 'metadata.liveStream'],
          },
        },
      );
      it('should include user in participants', function () {
        return expect(this.response.body.participants).to.include(this.user._id);
      });
    });
  });
});
