'use strict';

/**
 * Created by mk on 08/07/16.
 */

const chakram = require('chakram');

const specHelper = require('test/helper/specHelper');

const { expect } = chakram;

describe('Message Unread Socket', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const otherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);
  const anotherUser = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);

  const chat = specHelper.getFixture(specHelper.FIXTURE_TYPES.CHAT);
  const anotherChat = specHelper.getFixture(specHelper.FIXTURE_TYPES.CHAT);

  const message1 = specHelper.getFixture(specHelper.FIXTURE_TYPES.MESSAGE);
  const message2 = specHelper.getFixture(specHelper.FIXTURE_TYPES.MESSAGE);
  const message3 = specHelper.getFixture(specHelper.FIXTURE_TYPES.MESSAGE);
  const message4 = specHelper.getFixture(specHelper.FIXTURE_TYPES.MESSAGE);

  let userSocket;
  let otherUserSocket;
  let anotherUserSocket;

  before('create and sign in user', async () => {
    await specHelper.createUser(user);
    return specHelper.signInUser(user);
  });
  before('create and sign in otherUser', async () => {
    await specHelper.createUser(otherUser);
    return specHelper.signInUser(otherUser);
  });
  before('create and sign in anotherUser', async () => {
    await specHelper.createUser(anotherUser);
    return specHelper.signInUser(anotherUser);
  });
  before('open socket for user', async () => {
    userSocket = await specHelper.connectToSocket({
      extraHeaders: {
        Authorization: `Bearer ${user.auth.access_token}`,
      },
    });
  });
  before('open socket for otherUser', async () => {
    otherUserSocket = await specHelper.connectToSocket({
      extraHeaders: {
        Authorization: `Bearer ${otherUser.auth.access_token}`,
      },
    });
  });
  before('open socket for anotherUser', async () => {
    anotherUserSocket = await specHelper.connectToSocket({
      extraHeaders: {
        Authorization: `Bearer ${anotherUser.auth.access_token}`,
      },
    });
  });
  before('open chat by user', () => {
    Object.assign(chat, { user: user._id, typeParam: otherUser._id });
    return specHelper.openChat(userSocket, chat);
  });

  before('open chat by otherUser', () => {
    Object.assign(chat, { user: otherUser._id, typeParam: user._id });
    return specHelper.openChat(otherUserSocket, chat);
  });

  before('open chat by anotherUser', () => {
    Object.assign(anotherChat, { user: anotherUser._id, typeParam: user._id });
    return specHelper.openChat(anotherUserSocket, anotherChat);
  });

  before('set handler for wrong chat for anotherUser', () => {
    anotherUserSocket.once(`chat#${anotherChat._id}-new-message`, () => expect(false).to.be.true);
  });

  describe('Get initial chat countUnreadMessages', () => {
    let chatData;
    before('get chat', async () => {
      chatData = await specHelper.getChat(user, chat);
    });
    it('unreadMessagesCounter should be equal 0',
      () => expect(chatData.unreadMessagesCounter).to.be.equal(0));
  });

  describe('Create message', () => {
    let chatDataForUser;
    let chatDataForOtherUser;
    let messageData;
    before('create message', () => specHelper.createMessage(userSocket, chat._id, message1));
    before('create message', () => specHelper.createMessage(userSocket, chat._id, message2));
    before('get chat for user', async () => {
      chatDataForUser = await specHelper.getChat(user, chat);
    });
    before('get chat for otherUser', async () => {
      chatDataForOtherUser = await specHelper.getChat(otherUser, chat);
    });
    before('get message for otherUser', async () => {
      messageData = await specHelper.getMessage(otherUser, chat, message1);
    });
    it('unreadMessagesCounter for user should be equal 0',
      () => expect(chatDataForUser.unreadMessagesCounter).to.be.equal(0));
    it('unreadMessagesCounter for otherUser should be equal 2',
      () => expect(chatDataForOtherUser.unreadMessagesCounter).to.be.equal(2));
    it('unread.length for otherUser should be equal 1',
      () => expect(messageData.unread.length).to.be.equal(1));
    it('unread[0] for otherUser should be equal his ID',
      () => expect(messageData.unread[0]).to.be.equal(otherUser._id));
  });

  describe('Mark one as read', () => {
    let response;
    let chatDataForOtherUser;
    let messageData;
    let notification;
    before('send request', (done) => {
      const conditionalDone = () => {
        if (response && notification) {
          done();
        }
      };
      otherUserSocket.once('restdone', async (data) => {
        response = data.result;
        conditionalDone();
      });
      userSocket.once(`chat#${chat._id}-read-message`, (data) => {
        notification = data.data;
        conditionalDone();
      });
      otherUserSocket.emit(
        'restdone',
        {
          route: 'delete:/chats/:chat/messages/:_id/unread',
          params: {
            chat: chat._id,
            _id: message1._id,
          },
        },
      );
    });
    before('get chat for otherUser', async () => {
      chatDataForOtherUser = await specHelper.getChat(otherUser, chat);
    });
    before('get message for otherUser', async () => {
      messageData = await specHelper.getMessage(otherUser, chat, message1);
    });
    it('should return status 204', () => expect(response.statusCode).to.be.equal(204));
    it('unreadMessagesCounter for otherUser should be equal 1',
      () => expect(chatDataForOtherUser.unreadMessagesCounter).to.be.equal(1));
    it('should update message', () => expect(messageData.unread).to.not.include(otherUser));
    it('notification.message should have the same _id',
      () => expect(notification.message._id).to.be.equal(message1._id));
  });

  describe('Mark all as read', () => {
    let response;
    let chatDataBefore;
    let chatDataAfter;
    let notification;
    before('create reply message',
      () => specHelper.createMessage(otherUserSocket, chat._id, message3));
    before('create reply message',
      () => specHelper.createMessage(otherUserSocket, chat._id, message4));
    before('get chat for chatDataBefore', async () => {
      chatDataBefore = await specHelper.getChat(user, chat);
    });
    before('send request', (done) => {
      const conditionalDone = () => {
        if (response && notification) {
          done();
        }
      };
      userSocket.once('restdone', async (data) => {
        response = data.result;
        done();
      });
      otherUserSocket.once(`chat#${chat._id}-read-chat`, (data) => {
        notification = data.data;
        conditionalDone();
      });
      userSocket.emit(
        'restdone',
        {
          route: 'delete:/chats/:chat/messages/unread',
          params: {
            chat: chat._id,
          },
        },
      );
    });
    before('get chat for chatDataAfter', async () => {
      chatDataAfter = await specHelper.getChat(user, chat);
    });
    it('should return status 204', () => expect(response.statusCode).to.be.equal(204));
    it('unreadMessagesCounter before should be equal 2',
      () => expect(chatDataBefore.unreadMessagesCounter).to.be.equal(2));
    it('unreadMessagesCounter after should be equal 0',
      () => expect(chatDataAfter.unreadMessagesCounter).to.be.equal(0));
  });

  after('remove message1', () => specHelper.removeMessage(message1));
  after('remove message2', () => specHelper.removeMessage(message2));
  after('remove message3', () => specHelper.removeMessage(message3));
  after('remove message4', () => specHelper.removeMessage(message4));
  after('remove chat', () => specHelper.removeChat(chat));
  after('remove user', () => specHelper.removeUser(user));
  after('remove otherUser', () => specHelper.removeUser(otherUser));
  after('remove anotherUser', () => specHelper.removeUser(anotherUser));
});
