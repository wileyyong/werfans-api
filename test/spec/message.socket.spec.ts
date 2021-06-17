import specHelper from 'test/helper/specHelper';
import chai from 'chai';
import { SocketIoResponseResult, SocketIoTransportData } from 'restdone';
import { MessageResource } from '../../app/domains/message';

const { expect } = chai;

describe('Message Socket', () => {
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

  specHelper.withUserSocket({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 3),
    key: 'anotherUserSocket',
    userKey: 'anotherUser',
  });

  specHelper.withChat();

  before(async function () {
    Object.assign(this.chat, {
      user: this.otherUser._id,
      typeParam: this.user._id,
    });
    await specHelper.openChat(this.otherUserSocket, this.chat);
  });

  specHelper.withChat({
    key: 'anotherChat',
    userSocketKey: 'anotherUserSocket',
    userKey: 'anotherUser',
    typeParamKey: 'user',
  });

  const message1: Partial<MessageResource> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.MESSAGE,
  );
  const message2: Partial<MessageResource> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.MESSAGE,
  );
  const message3: Partial<MessageResource> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.MESSAGE,
  );

  before('set handler for wrong chat for anotherUser', function () {
    this.anotherUserSocket.once(`chat#${this.anotherChat._id}-new-message`, () => expect(false).to.be.true);
  });

  describe('Create message', () => {
    let messagesCounterBefore: number;
    let messagesCounterAfter: number;
    let response: SocketIoResponseResult;
    let chatEvent: Record<string, any>;
    before('get messagesCounter before', async function () {
      messagesCounterBefore = (await specHelper.getChat(this.user, this.chat)).messagesCounter;
    });
    specHelper.withSocketHandler({
      eventName: 'new-user-notification',
      key: 'userSocket',
      shouldBeSilent: true,
    });
    specHelper.withSocketHandler({
      eventName: 'new-user-notification',
      key: 'otherUserSocket',
      makeSnapShot: {
        mask: [
          'data._id',
          'data.recipients',
          'data.unread',
          'data.metadata.chat',
          'data.createdAt',
          'data.updatedAt',
        ],
      },
    });
    before('send request', function (done) {
      const conditionalDone = () => {
        if (response && chatEvent) {
          done();
        }
      };
      this.userSocket.once('restdone', (data: SocketIoTransportData) => {
        response = data.result!;
        conditionalDone();
      });
      this.otherUserSocket.once(`chat#${this.chat._id}-new-message`, (data: SocketIoTransportData & { data: Record<string, any>}) => {
        chatEvent = data.data;
        conditionalDone();
      });
      this.userSocket.emit('restdone',
        { route: 'post:/chats/:chat/messages', params: { chat: this.chat._id }, body: message1 });
    });
    before('get messagesCounter after', async function () {
      messagesCounterAfter = (await specHelper.getChat(this.user, this.chat)).messagesCounter;
    });
    it('should return status 201', () => expect(response.statusCode).to.be.equal(201));
    it('should contain _id', () => {
      message1._id = response.body._id;
      return expect(response.body._id).to.exist;
    });
    it('chatEvent.message should have the same _id',
      () => expect(chatEvent.message._id).to.be.equal(message1._id));
    it('chatEvent.message should have the same body',
      () => expect(chatEvent.message.body).to.be.equal(message1.body));
    it('chatEvent.message should have the same author',
      function () {
        return expect(chatEvent.message.author).to.be.equal(this.user._id);
      });
    it('messagesCounterBefore should be 0', () => messagesCounterBefore.should.be.equal(0));
    it('messagesCounterAfter should increase by 1',
      () => messagesCounterAfter.should.be.equal(messagesCounterBefore + 1));
  });

  describe('Create a reply message', () => {
    let response: SocketIoResponseResult;
    let notification: Record<string, any>;

    before('send request', function (done) {
      const conditionalDone = () => {
        if (response && notification) {
          done();
        }
      };
      this.otherUserSocket.once('restdone', (data: SocketIoTransportData) => {
        response = data.result!;
        conditionalDone();
      });
      this.userSocket.once(`chat#${this.chat._id}-new-message`, (data: SocketIoTransportData & { data: Record<string, any>}) => {
        notification = data.data;
        conditionalDone();
      });
      this.otherUserSocket.emit('restdone',
        { route: 'post:/chats/:chat/messages', params: { chat: this.chat._id }, body: message2 });
    });

    it('should return status 201', () => expect(response.statusCode).to.be.equal(201));
    it('should contain _id', () => {
      message2._id = response.body._id;
      return expect(response.body._id).to.exist;
    });
    it('notification.message should have the same _id',
      () => expect(notification.message._id).to.be.equal(message2._id));
    it('notification.body should have the same body',
      () => expect(notification.message.body).to.be.equal(message2.body));
    it('notification.message should have the same author',
      function () {
        return expect(notification.message.author).to.be.equal(this.otherUser._id);
      });
  });

  describe('Create message pretending otherUser', () => {
    let response: SocketIoResponseResult;

    before('send request', function (done) {
      this.userSocket.once('restdone', (data: SocketIoTransportData) => {
        response = data.result!;
        done();
      });
      this.userSocket.emit('restdone',
        {
          route: 'post:/chats/:chat/messages',
          params: { chat: this.chat._id, author: this.otherUser._id },
          body: message3,
        });
    });
    it('should return status 403', () => expect(response.statusCode).to.be.equal(403));
  });

  describe('Create message in wrong chat', () => {
    let response: SocketIoResponseResult;
    before('send request', function (done) {
      this.anotherUserSocket.once('restdone', (data: SocketIoTransportData) => {
        response = data.result!;
        done();
      });
      this.anotherUserSocket.emit('restdone',
        { route: 'post:/chats/:chat/messages', params: { chat: this.chat._id }, body: message3 });
    });
    it('should return status 400', () => expect(response.statusCode).to.be.equal(400));
  });

  describe('Update message', () => {
    describe('change body', () => {
      const NEW_BODY = 'new-body';
      let response: SocketIoResponseResult;
      let notification: Record<string, any>;
      before('send request', function (done) {
        const conditionalDone = () => {
          if (response && notification) {
            done();
          }
        };
        this.userSocket.once('restdone', (data: SocketIoTransportData) => {
          response = data.result!;
          conditionalDone();
        });
        this.otherUserSocket.once(`chat#${this.chat._id}-update-message`, (data: SocketIoTransportData & { data: Record<string, any>}) => {
          notification = data.data;
          conditionalDone();
        });
        this.userSocket.emit('restdone',
          {
            route: 'patch:/chats/:chat/messages/:_id',
            params: { chat: this.chat._id, _id: message1._id },
            body: { body: NEW_BODY },
          });
      });
      it('should return status 200', () => expect(response.statusCode).to.be.equal(200));
      it('should contain _id', () => {
        message1._id = response.body._id;
        return expect(response.body._id).to.exist;
      });
      it('notification.message should have the same _id',
        () => expect(notification.message._id).to.be.equal(message1._id));
      it('notification.message should have new body',
        () => expect(notification.message.body).to.be.equal(NEW_BODY));
      it('notification.message should have the same author',
        function () {
          return expect(notification.message.author).to.be.equal(this.user._id);
        });
      after(() => {
        message1.body = NEW_BODY;
      });
    });
  });

  describe('Get messages by user', () => {
    let response: SocketIoResponseResult;

    before('send request', function (done) {
      this.userSocket.once('restdone', (data: SocketIoTransportData) => {
        response = data.result!;
        done();
      });
      this.userSocket.emit('restdone',
        { route: 'get:/chats/:chat/messages', params: { chat: this.chat._id } });
    });
    it('should return status 200', () => expect(response.statusCode).to.be.equal(200));
    it('should be an array', () => expect(response.body).to.be.instanceof(Array));
    it('should contain 2 item', () => expect(response.body.length).to.be.equal(2));
    it('[0]._id should contain the same _id',
      () => expect(response.body[0]._id).to.be.equal(message1._id));
    it('[1]._id should contain the same _id',
      () => expect(response.body[1]._id).to.be.equal(message2._id));
  });

  describe('Get messages by otherUser', () => {
    let response: SocketIoResponseResult;

    before('send request', function (done) {
      this.otherUserSocket.once('restdone', (data: SocketIoTransportData) => {
        response = data.result!;
        done();
      });
      this.otherUserSocket.emit('restdone',
        { route: 'get:/chats/:chat/messages', params: { chat: this.chat._id } });
    });

    it('should return status 200', () => expect(response.statusCode).to.be.equal(200));
    it('should be an array', () => expect(response.body).to.be.instanceof(Array));
    it('should contain 2 item', () => expect(response.body.length).to.be.equal(2));
    it('[0]._id should contain the same _id', () => expect(response.body[0]._id).to.be.equal(message1._id));
    it('[1]._id should contain the same _id', () => expect(response.body[1]._id).to.be.equal(message2._id));
  });

  describe('Get messages by anotherUser', () => {
    let response: SocketIoResponseResult;

    before('send request', function (done) {
      this.anotherUserSocket.once('restdone', (data: SocketIoTransportData) => {
        response = data.result!;
        done();
      });
      this.anotherUserSocket.emit('restdone',
        { route: 'get:/chats/:chat/messages', params: { chat: this.chat._id } });
    });

    it('should return status 400', () => expect(response.statusCode).to.be.equal(400));
  });

  after('remove message3', () => specHelper.removeMessage(message3));
  after('remove message2', () => specHelper.removeMessage(message2));
  after('remove message1', () => specHelper.removeMessage(message1));
});
