import _ from 'lodash';
import request, { RequestPromise } from 'request-promise';
import { CoreOptions } from 'request';
import io from 'socket.io-client';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import chaiThings from 'chai-things';
import sinon, { SinonMock, SinonStub } from 'sinon';
import chaiSnapshot from 'mocha-pro';
import { SocketIoRequest, SocketIoTransportData, SocketIoTransportResponse } from 'restdone';
import { deleteObjects } from 'app/lib/s3.helper';
import testConfig from 'test/config';
import app from 'app';
import { Service } from 'moleculer';
import { UserResource } from '../../app/domains/user';
import { ChatResource, ChatType } from '../../app/domains/chat';
import { MessageResource } from '../../app/domains/message';
import { LiveStreamResource, LiveStreamState } from '../../app/domains/liveStream';
import { CommentResource } from '../../app/domains/comment';
import { AlbumResource } from '../../app/domains/album';
import { PhotoResource } from '../../app/domains/photo';
import { RewardResource } from '../../app/domains/reward';
import { UserConfigResource } from '../../app/domains/userConfig';
import { VideoResource } from '../../app/domains/video';
import { NotificationDocument, NotificationDomain, NotificationResource } from '../../app/domains/notification';
import { StrikeResource, StrikeType } from '../../app/domains/strike';
import { SystemNotificationResource } from '../../app/domains/systemNotification';
import { GoalResource } from '../../app/domains/goal';
import { FeedbackResource } from '../../app/domains/feedback';
import { ReportResource } from '../../app/domains/report';
import { MoleculerService } from '../../app/lib/services/moleculer.service/moleculer.service';
import { ReviewResource } from '../../app/domains/review';
import { BalanceRecordResource, BalanceRecordType } from '../../app/domains/balanceRecord';
import { BalanceRecordRefModel } from '../../app/domains/balanceRecordRefModel';

import Context = Mocha.Context;

const {
  config,
  modelProvider: {
    Album,
    BalanceRecord,
    Chat,
    Comment,
    Feedback,
    Goal,
    LiveStream,
    Message,
    Notification,
    Photo,
    RefreshToken,
    Report,
    Review,
    Reward,
    Strike,
    SystemNotification,
    User,
    UserConfig,
    Video,
  },
  moleculerBroker,
  moleculerService,
} = app;

chai.use(chaiAsPromised);
chai.use(chaiThings);
chai.use(chaiSnapshot);

chai.should();
const { expect } = chai;

type MakeSnapShotParam = { isForced?: boolean, mask?: any[], description?: string };

// eslint-disable-next-line @typescript-eslint/naming-convention
export enum FIXTURE_TYPES {
  ALBUM = 'album.data',
  CHAT = 'chat.data',
  COMMENT = 'comment.data',
  FEEDBACK = 'feedback.data',
  GOAL = 'goal.data',
  LIVE_STREAM = 'liveStream.data',
  MESSAGE = 'message.data',
  NOTIFICATION = 'notification.data',
  PHOTO = 'photo.data',
  STRIKE_TYPE = 'strikeType.data',
  REPORT = 'report.data',
  REWARD = 'reward.data',
  REVIEW = 'review.data',
  VIDEO = 'video.data',
  STRIKE = 'strike.data',
  SYSTEM_NOTIFICATION = 'systemNotification.data',
  USER = 'user.data',
  USER_CONFIG = 'userConfig.data'
}

export interface EmailData {
  to: string;
  html: string;
}

const clientAuth = {
  client_id: testConfig.client.id,
  client_secret: testConfig.client.secret,
};

function assertUserAuth(userData: Pick<UserResource, 'auth'>) {
  if (!userData.auth) {
    throw new Error('User should be authenticated');
  }
}

const specHelper = {

  FIXTURE_TYPES,

  get(uri: string, options?: Partial<CoreOptions>) {
    return this.request('GET', uri, undefined, options);
  },
  post(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('POST', uri, body, options);
  },
  patch(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('PATCH', uri, body, options);
  },
  put(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('PUT', uri, body, options);
  },
  delete(uri: string, body: any, options?: Partial<CoreOptions>) {
    return this.request('DELETE', uri, body, options);
  },
  request(method: string, uri: string, body: any, options?: Partial<CoreOptions>) {
    return request({
      method,
      uri,
      body,
      resolveWithFullResponse: true,
      simple: false,
      json: true,
      ...options,
    });
  },

  connectToSocket(
    options: SocketIOClient.ConnectOpts & { extraHeaders?: Record<string, any> } = {},
  ): Promise<SocketIOClient.Socket> {
    return new Promise((resolve) => {
      options.extraHeaders = options.extraHeaders || {};
      options.extraHeaders.referer = testConfig.baseUrl;
      const socket = io.connect(testConfig.baseUrl, options);
      socket.on('connect', () => {
        resolve(socket);
      });
    });
  },

  getFixture<T = object>(fixtureType: FIXTURE_TYPES, seed?: number, data?: T): T {
    // eslint-disable-next-line import/no-dynamic-require, global-require
    const resolvedRequire = require(`../data/${fixtureType}`);
    const fixtureProvider = resolvedRequire?.default || resolvedRequire;
    let result;
    if (_.isArray(fixtureProvider)) {
      if (_.isUndefined(seed)) {
        seed = Math.floor(Math.random() * fixtureProvider.length);
      } else if (!_.isNumber(seed) || seed >= fixtureProvider.length) {
        throw new Error(`Wrong seed value: ${seed}`);
      }
      result = { ...fixtureProvider[seed] };
    } else if (_.isFunction(fixtureProvider)) {
      seed = seed || Math.floor(Math.random() * 1000000);
      result = fixtureProvider(seed);
    } else {
      throw new Error(`Unsupported fixture provider: ${fixtureType}`);
    }
    return Object.assign(result, data || {});
  },

  getClientAuth() {
    return { ...clientAuth };
  },

  getBasicAuth(client?: { clientId: string, clientSecret: string }) {
    const clientId = client ? client.clientId : clientAuth.client_id;
    const clientSecret = client ? client.clientSecret : clientAuth.client_secret;

    return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
  },

  getDefaultAdminUser() {
    return <Partial<UserResource>>{ ...config.defaultUser };
  },

  async fetchAndClearSentEmails(): Promise<EmailData[]> {
    const result = await this.get(`${testConfig.baseUrl}/testing/sent-emails`);
    return result.body;
  },

  async createUser(data: Partial<UserResource>, login = false): Promise<UserResource> {
    const result = await this.post(
      `${testConfig.baseUrl}/users`,
      { ...this.getClientAuth(), ...data },
    );
    data._id = result.body._id;
    if (login) {
      await this.signInUser(data);
    }
    return result.body;
  },

  async signInUser(data: Partial<UserResource>) {
    const result = await this.post(
      `${testConfig.baseUrl}/oauth`,
      {
        grant_type: 'password',
        ..._.pick(data, 'username', 'password'),
        ...this.getClientAuth(),
      },
    );
    data.auth = {
      access_token: result.body.access_token,
      refresh_token: result.body.refresh_token,
    };
    return result.body;
  },

  async banUser(userData: Partial<UserResource>, data: Partial<UserResource>) {
    const result = await this.post(
      `${testConfig.baseAdminUrl}/users/${data._id}/ban`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async unbanUser(userData: Partial<UserResource>, data: Partial<UserResource>) {
    const result = await this.post(
      `${testConfig.baseAdminUrl}/users/${data._id}/unban`,
      {},
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  openChat(
    socket: SocketIOClient.Socket,
    data: Partial<ChatResource> & { user: string, typeParam: string },
  ): Promise<Partial<ChatResource>> {
    return new Promise((resolve, reject) => {
      socket.once('restdone', (result: SocketIoTransportResponse) => {
        const response = result.result;
        if (response.statusCode === 200) {
          data._id = response.body._id;
          resolve(data);
        } else {
          reject(new Error(`Wrong status code ${response.statusCode}`));
        }
      });

      socket.emit('restdone',
        {
          route: 'put:/chats/:chatType/with/:typeParam',
          params: {
            chatType: ChatType.Private,
            user: data.user,
            typeParam: data.typeParam,
          },
        });
    });
  },

  async addUserSubscribers(
    userData: Partial<UserResource>,
    subscriberUserData: Partial<UserResource>,
  ) {
    return Promise.all([
      User.updateOne(
        {
          _id: userData._id,
        },
        {
          $push: { subscribers: subscriberUserData._id },
        },
      ),
      User.updateOne(
        {
          _id: subscriberUserData._id,
        },
        {
          $push: {
            subscriptions: {
              targetUser: userData._id,
              active: true,
              billing: {
                subscriptionId: '',
                transactionId: '',
                purchasedTimestamp: '',
              },
            },
          },
        },
      ),
    ]);
  },

  async removeUserSubscribers(
    userData: Partial<UserResource>,
    subscriberUserData: Partial<UserResource>,
  ) {
    return Promise.all([
      User.updateOne(
        {
          _id: userData._id,
        },
        {
          $pull: { subscribers: subscriberUserData._id },
        },
      ),
      User.updateOne(
        {
          _id: subscriberUserData._id,
        },
        {
          $pull: {
            subscriptions: {
              targetUser: userData._id,
            },
          },
        },
      ),
    ]);
  },

  async getUser(
    adminUserData: Partial<UserResource>,
    data?: Partial<UserResource>,
    userId?: string,
  ) {
    assertUserAuth(adminUserData);
    data = data || adminUserData;
    userId = userId || data._id;
    const result = await this.get(
      `${testConfig.baseUrl}/users/${userId}`,
      { headers: { Authorization: `Bearer ${adminUserData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  resetUserBalance(balance: number = 0, key: string = 'user') {
    before(function () {
      return User.updateOne(
        { _id: this[key]._id },
        { balance },
      );
    });
  },

  async removeUser(data: Partial<UserResource>) {
    return data._id && User.deleteOne({ _id: data._id });
  },

  async removeFile(filename: string) {
    await deleteObjects(filename);
  },

  async createChat(
    userData: Partial<UserResource>,
    otherUserData: Partial<UserResource>,
    data: Partial<ChatResource>,
  ) {
    assertUserAuth(userData);
    const result = await this.put(
      `${testConfig.baseUrl}/users/me/chats/${otherUserData._id}`,
      {},
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async getChat(
    userData: Partial<UserResource>,
    data: Partial<ChatResource>,
  ): Promise<ChatResource> {
    assertUserAuth(userData);
    const result = await this.get(
      `${testConfig.baseUrl}/users/me/chats/${data._id}`,
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async removeChat(data: Partial<ChatResource>) {
    if (data._id) {
      return Chat.deleteOne({ _id: data._id });
    } else {
      return null;
    }
  },

  createMessage(
    socket: SocketIOClient.Socket,
    chatId: string,
    data: Partial<MessageResource>,
  ): Promise<Partial<MessageResource>> {
    return new Promise((resolve, reject) => {
      socket.once('restdone', (payload: SocketIoTransportResponse) => {
        const response = payload.result;
        if (response.statusCode === 201) {
          data._id = response.body._id;
          resolve(data);
        } else {
          reject(new Error(`Wrong status code ${response.statusCode}`));
        }
      });
      socket.emit('restdone',
        {
          route: 'post:/chats/:chat/messages',
          params: { chat: chatId },
          body: data,
        });
    });
  },

  async getMessage(
    userData: Partial<UserResource>,
    chat: Partial<ChatResource>,
    data: Partial<MessageResource>,
  ) {
    assertUserAuth(userData);
    const result = await this.get(
      `${testConfig.baseUrl}/chats/${chat._id}/messages/${data._id}`,
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async banMessage(userData: Partial<UserResource>, data: Partial<MessageResource>) {
    const result = await this.post(
      `${testConfig.baseAdminUrl}/messages/${data._id}/ban`,
      {
        banningReasonType: StrikeType.Spam,
      },
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async unbanMessage(data: Partial<MessageResource>) {
    return Message.unban(data._id!);
  },

  async removeMessage(data: Partial<MessageResource>) {
    if (data._id) {
      return Message.deleteOne({ _id: data._id });
    } else {
      return null;
    }
  },

  async createLiveStream(
    userData: Partial<UserResource>,
    data: Partial<LiveStreamResource>,
  ): Promise<LiveStreamResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/users/${userData._id}/live-streams`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async startLiveStream(
    userData: Partial<UserResource>,
    data: Partial<LiveStreamResource>,
  ): Promise<LiveStreamResource> {
    assertUserAuth(userData);
    const result = await this.put(
      `${testConfig.baseUrl}/users/${userData._id}/live-streams/${data._id}`,
      {},
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    return result.body;
  },

  async removeLiveStream(data: LiveStreamResource) {
    return data._id && LiveStream.deleteOne({ _id: data._id });
  },

  async createComment(
    userData: Partial<UserResource>,
    liveStreamData: LiveStreamResource,
    commentData: Partial<CommentResource>,
  ): Promise<CommentResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/live-streams/${liveStreamData._id}/comments`,
      { ...commentData },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    commentData._id = result.body._id;
    return result.body;
  },

  async removeComment(comment: Partial<CommentResource>) {
    return comment._id && Comment.deleteOne({ _id: comment._id });
  },

  async createAlbum(
    userData: Partial<UserResource>,
    data: Partial<AlbumResource>,
  ): Promise<AlbumResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/users/${userData._id}/albums`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async banAlbum(userData: Partial<UserResource>, data: Partial<AlbumResource>) {
    const result = await this.post(
      `${testConfig.baseAdminUrl}/albums/${data._id}/ban`,
      {
        banningReasonType: StrikeType.Spam,
      },
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async unbanAlbum(data: Partial<AlbumResource>) {
    return Album.unban(data._id!);
  },

  async removeAlbum(data: AlbumResource) {
    return data._id && Album.deleteOne({ _id: data._id });
  },

  async createPhoto(
    userData: Partial<UserResource>,
    albumData: AlbumResource,
    data: Partial<PhotoResource>,
  ): Promise<PhotoResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/albums/${albumData._id}/photos`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async banPhoto(userData: Partial<UserResource>, data: Partial<PhotoResource>) {
    const result = await this.post(
      `${testConfig.baseAdminUrl}/photos/${data._id}/ban`,
      {
        banningReasonType: StrikeType.Spam,
      },
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async unbanPhoto(data: Partial<PhotoResource>) {
    return Photo.unban(data._id!);
  },

  async removePhoto(data: PhotoResource) {
    return data._id && Photo.deleteOne({ _id: data._id });
  },

  async createReward(
    userData: Partial<UserResource>,
    data: Partial<RewardResource>,
  ): Promise<RewardResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/rewards`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeReward(data: RewardResource) {
    return data._id && Reward.deleteOne({ _id: data._id });
  },

  async createReview(
    userData: Partial<UserResource>,
    targetUserData: Partial<UserResource>,
    data: Partial<ReviewResource>,
  ): Promise<ReviewResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/users/${targetUserData._id}/reviews`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeReview(data: ReviewResource) {
    return data._id && Review.deleteOne({ _id: data._id });
  },

  withReview(options?: {
    data?: Partial<ReviewResource>;
    key?: string;
    userKey?: string;
    targetUserKey?: string;
  }) {
    const { data, key = 'review', userKey = 'user', targetUserKey = 'targetUser' } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.REVIEW);
      await specHelper.createReview(this[userKey], this[targetUserKey], this[key]);
    });

    after(function () {
      return specHelper.removeReview(this[key]);
    });
  },

  async createVideo(
    userData: Partial<UserResource>,
    data: Partial<VideoResource>,
  ): Promise<VideoResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/users/${userData._id}/videos`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async banVideo(userData: Partial<UserResource>, data: Partial<VideoResource>) {
    const result = await this.post(
      `${testConfig.baseAdminUrl}/videos/${data._id}/ban`,
      {
        banningReasonType: StrikeType.Spam,
      },
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async unbanVideo(data: Partial<VideoResource>) {
    return Video.unban(data._id!);
  },

  async removeVideo(data: VideoResource) {
    return data._id && Video.deleteOne({ _id: data._id });
  },

  async createSystemNotification(
    userData: Partial<UserResource>,
    data: Partial<SystemNotificationResource>,
  ): Promise<SystemNotificationResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/system-notifications`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeSystemNotification(data: SystemNotificationResource) {
    return data._id && SystemNotification.deleteOne({ _id: data._id });
  },

  async createNotification(
    data: Partial<NotificationDomain>,
    recipientsData?: Partial<UserResource>[],
  ) {
    const recipients = recipientsData ? recipientsData.map(({ _id }) => _id) : [];
    const readable = recipients.length > 0;
    Object.assign(data, { recipients, readable });
    const notification = await Notification.create(data);
    Object.assign(data, notification.toJSON());
  },

  async getNotifications(userData: Partial<UserResource>): Promise<NotificationResource[]> {
    assertUserAuth(userData);
    const result = await this.get(
      `${testConfig.baseUrl}/users/${userData._id}/notifications`,
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async getNotification(
    userData: Partial<UserResource>,
    data: Partial<NotificationResource>,
  ): Promise<NotificationResource> {
    assertUserAuth(userData);
    const result = await this.get(
      `${testConfig.baseUrl}/users/${userData._id}/notifications/${data._id}`,
      {
        headers: {
          Authorization: `Bearer ${userData.auth!.access_token}`,
        },
      },
    );
    return result.body;
  },

  async getNotificationFromDb(
    data: Partial<NotificationResource>,
  ): Promise<NotificationDocument | null> {
    return Notification.findOne({ _id: data._id });
  },

  async removeNotification(data: Partial<NotificationResource>) {
    return data._id && Notification.deleteOne({ _id: data._id });
  },

  async removeAllNotifications() {
    return Notification.deleteMany({});
  },

  async createStrike(
    userData: Partial<UserResource>,
    data: Partial<StrikeResource>,
  ): Promise<StrikeResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/admin/strikes`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeStrike(data: StrikeResource) {
    return data._id && Strike.deleteOne({ _id: data._id });
  },

  withStrike(options?: {
    data?: Partial<StrikeResource>;
    key?: string;
    seed?: number;
    creatorKey?: string;
    refKey?: string,
    refModel?: string,
    targetUserKey?: string;
  }) {
    const {
      data,
      key = 'strike',
      seed,
      creatorKey = 'adminUser',
      refKey,
      refModel,
      targetUserKey = 'user',
    } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.STRIKE, seed);
      if (refKey) {
        this[key].ref = this[refKey]._id;
      }
      if (refModel) {
        this[key].refModel = refModel;
      }
      this[key].targetUser = this[targetUserKey]._id;
      await specHelper.createStrike(this[creatorKey], this[key]);
    });

    after(function () {
      return specHelper.removeStrike(this[key]);
    });
  },

  async createGoal(
    userResource: Partial<UserResource>,
    liveStreamResource: Partial<LiveStreamResource>,
    data: Partial<GoalResource>,
  ): Promise<GoalResource> {
    const result = await this.post(
      `${testConfig.baseUrl}/live-streams/${liveStreamResource._id}/goals`,
      { ...data },
      { headers: { Authorization: `Bearer ${userResource.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeGoal(data: GoalResource) {
    return data._id && Goal.deleteOne({ _id: data._id });
  },

  withGoal(options?: {
    data?: Partial<GoalResource>;
    extraData?: Partial<GoalResource>;
    key?: string;
    seed?: number;
    liveStreamKey?: string;
    userKey?: string;
  }) {
    const {
      data,
      extraData,
      key = 'goal',
      liveStreamKey = 'liveStream',
      seed,
      userKey = 'user',
    } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.GOAL, seed, extraData);
      await specHelper.createGoal(this[userKey], this[liveStreamKey], this[key]);
    });

    after(function () {
      return specHelper.removeGoal(this[key]);
    });
  },

  async createFeedback(
    userData: Partial<UserResource>,
    data: Partial<FeedbackResource>,
  ): Promise<FeedbackResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/users/${userData._id}/feedbacks`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeFeedback(data: FeedbackResource) {
    return data._id && Feedback.deleteOne({ _id: data._id });
  },

  withFeedback(options?: {
    data?: Partial<FeedbackResource>,
    key?: string,
    seed?: number,
    userKey?: string,
  }) {
    const {
      data,
      key = 'feedback',
      seed,
      userKey = 'user',
    } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.FEEDBACK, seed);
      await specHelper.createFeedback(this[userKey], this[key]);
    });

    after(function () {
      return specHelper.removeFeedback(this[key]);
    });
  },

  async createReport(
    userData: Partial<UserResource>,
    data: Partial<ReportResource>,
  ): Promise<ReportResource> {
    assertUserAuth(userData);
    const result = await this.post(
      `${testConfig.baseUrl}/users/me/reports`,
      { ...data },
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeReport(data: ReportResource) {
    if (data._id) {
      return Report.deleteOne({ _id: data._id });
    } else {
      return null;
    }
  },

  async createUserConfig(
    userData: Partial<UserResource>,
    data: Partial<UserConfigResource>,
  ): Promise<ReportResource> {
    assertUserAuth(userData);
    const { key, ...body } = data;
    const result = await this.put(
      `${testConfig.baseUrl}/users/me/configs/${key}`,
      body,
      { headers: { Authorization: `Bearer ${userData.auth!.access_token}` } },
    );
    data._id = result.body._id;
    return result.body;
  },

  async removeUserConfig(data: ReportResource) {
    if (data._id) {
      return UserConfig.deleteOne({ _id: data._id });
    } else {
      return null;
    }
  },

  withAdminUser(adminUserData: Partial<UserResource> = config.defaultUser) {
    before(function () {
      this.adminUser = _.cloneDeep(adminUserData);
      return specHelper.signInUser(this.adminUser);
    });
  },

  withUser(options: {
    data?: Partial<UserResource>;
    key?: string;
    login?: boolean;
    seed?: number;
  } = {}) {
    const { data, key = 'user', login = true, seed } = options;
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, seed);
      await specHelper.createUser(this[key], login);
    });

    after(function () {
      return specHelper.removeUser(this[key]);
    });
  },

  withUserSocket(options: {
    data?: Partial<UserResource>,
    key?: string,
    seed?: number;
    shouldWithUser?: boolean,
    userKey?: string,
  } = {}) {
    const { data, key = 'userSocket', userKey = 'user', seed, shouldWithUser = true } = options;
    if (shouldWithUser) {
      specHelper.withUser({
        data,
        key: userKey,
        login: true,
        seed,
      });
    }
    before('open socket for user', async function () {
      this[key] = await specHelper.connectToSocket({
        extraHeaders: {
          Authorization: `Bearer ${this[userKey].auth.access_token}`,
        },
      });
    });
  },

  withChat(options?: {
    data?: Partial<ChatResource>,
    key?: string,
    typeParamKey?: string,
    userKey?: string,
    userSocketKey?: string,
  }) {
    const {
      data,
      key = 'chat',
      typeParamKey = 'otherUser',
      userKey = 'user',
      userSocketKey = 'userSocket',
    } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.CHAT);
      Object.assign(this[key], {
        user: this[userKey]._id,
        typeParam: this[typeParamKey]._id,
      });
      return specHelper.openChat(this[userSocketKey], this[key]);
    });

    after(function () {
      return specHelper.removeChat(this[key]);
    });
  },

  withSocketHandler(options: {
    key?: string;
    resultKey?: string;
    eventName: string;
    shouldBeSilent?: boolean;
    timeout?: number;
    makeSnapShot?: MakeSnapShotParam,
  }) {
    const {
      eventName,
      key = 'userSocket',
      resultKey = 'socketEventData',
      shouldBeSilent,
      timeout = 500,
      makeSnapShot,
    } = options;

    let timeoutHandler: NodeJS.Timeout;
    let done = false;
    let socketEventData: any;
    let wasTimeout: boolean = false;

    before(function (this: Context) {
      this[key].once(eventName, (result: any) => {
        if (!done) {
          done = true;
          socketEventData = result;
          this[resultKey] = result;
          if (timeoutHandler) {
            clearTimeout(timeoutHandler);
          }
        }
      });
    });

    it(shouldBeSilent ? 'should not fire' : 'should fire', async () => {
      if (!done) {
        await new Promise((resolve) => {
          timeoutHandler = setTimeout(() => {
            if (!done) {
              done = true;
              wasTimeout = true;
              resolve();
            }
          }, timeout);
        });
      }
      if (shouldBeSilent) {
        return expect(wasTimeout).to.be.true;
      } else {
        return expect(wasTimeout).to.be.false;
      }
    });

    if (makeSnapShot && !wasTimeout) {
      it('response should match', function () {
        // eslint-disable-next-line no-restricted-properties
        return makeSnapShot.isForced
          // eslint-disable-next-line no-restricted-properties
          ? expect(specHelper.maskPaths(
            socketEventData,
            makeSnapShot.mask || [],
          )).isForced.matchSnapshot(this)
          : expect(specHelper.maskPaths(
            socketEventData,
            makeSnapShot.mask || [],
          )).matchSnapshot(this);
      });
    }
  },

  withAlbum(options?: {
    data?: Partial<AlbumResource>,
    extraData?: Partial<AlbumResource>,
    key?: string,
    seed?: number;
    userKey?: string;
  }) {
    const {
      data,
      extraData,
      key = 'album',
      seed,
      userKey = 'user',
    } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.ALBUM, seed, extraData);
      await specHelper.createAlbum(this[userKey], this[key]);
    });

    after(function () {
      return specHelper.removeAlbum(this[key]);
    });
  },

  withSystemNotification(
    options?: {
      data?: Partial<SystemNotificationResource>,
      key?: string,
      userKey?: string,
    },
  ) {
    const { data, key = 'systemNotification', userKey = 'adminUser' } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.SYSTEM_NOTIFICATION, 1, 'Testing');
      await specHelper.createSystemNotification(this[userKey], this[key]);
    });

    after(function () {
      return specHelper.removeSystemNotification(this[key]);
    });
  },

  withComment(
    options?: {
      data?: Partial<CommentResource>,
      key?: string,
      liveStreamKey?: string,
      userKey?: string,
    },
  ) {
    const { data, key = 'comment', liveStreamKey = 'liveStream', userKey = 'user' } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.COMMENT);
      await specHelper.createComment(this[userKey], this[liveStreamKey], this[key]);
    });

    after(function () {
      return specHelper.removeComment(this[key]);
    });
  },

  withLiveStream(options?: {
    data?: Partial<LiveStreamResource>;
    extraData?: Partial<LiveStreamResource>;
    key?: string;
    seed?: number;
    userKey?: string;
    shouldMakeOnAir?: boolean;
  }) {
    const {
      data,
      extraData,
      key = 'liveStream',
      seed,
      shouldMakeOnAir = false,
      userKey = 'user',
    } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.LIVE_STREAM, seed, extraData);
      await specHelper.createLiveStream(this[userKey], this[key]);
      if (shouldMakeOnAir) {
        await LiveStream.updateOne({ _id: this[key]._id }, { state: LiveStreamState.OnAir });
      }
    });

    after(function () {
      return specHelper.removeLiveStream(this[key]);
    });
  },

  withPhoto(options?: {
    data?: Partial<PhotoResource>,
    key?: string,
    albumKey?: string,
    userKey?: string,
  }) {
    const {
      data,
      key = 'photo',
      albumKey = 'album',
      userKey = 'user',
    } = options || {};
    before(function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.PHOTO);
      return specHelper.createPhoto(this[userKey], this[albumKey], this[key]);
    });
    after(function () {
      return specHelper.removePhoto(this[key]);
    });
  },

  withVideo(options?: {
    data?: Partial<VideoResource>,
    extraData?: Partial<VideoResource>,
    key?: string,
    seed?: number,
    userKey?: string,
  }) {
    const {
      data,
      extraData,
      key = 'video',
      seed,
      userKey = 'user',
    } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.VIDEO, seed, extraData);
      await specHelper.createVideo(this[userKey], this[key]);
    });

    after(function () {
      return specHelper.removeVideo(this[key]);
    });
  },

  withReport(options?: { data?: Partial<ReportResource>, key?: string, userKey?: string }) {
    const { data, key = 'report', userKey = 'user' } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.REPORT);
      await specHelper.createReport(this[userKey], this[key]);
    });

    after(function () {
      return specHelper.removeReport(this[key]);
    });
  },

  withUserConfig(options?: { data?: Partial<ReportResource>, key?: string, userKey?: string }) {
    const { data, key = 'userConfig', userKey = 'user' } = options || {};
    before(async function () {
      this[key] = data
        ? _.cloneDeep(data)
        : specHelper.getFixture(specHelper.FIXTURE_TYPES.USER_CONFIG);
      await specHelper.createUserConfig(this[userKey], this[key]);
    });

    after(function () {
      return specHelper.removeUserConfig(this[key]);
    });
  },

  async removeBalanceRecord(data: BalanceRecordResource) {
    return data._id && BalanceRecord.deleteOne({ _id: data._id });
  },

  withBalanceRecord(options: {
    key?: string;
    type: BalanceRecordType;
    sum?: number;
    refKey?: string;
    refModel?: BalanceRecordRefModel;
    ownerKey?: string;
  }) {
    const {
      key = 'balanceRecord',
      type,
      sum = 1,
      refKey,
      refModel,
      ownerKey = 'user',
    } = options;
    before(async function () {
      this[key] = await BalanceRecord.create({
        owner: this[ownerKey],
        type,
        sum,
        ref: refKey ? this[refKey]._id : undefined,
        refModel,
      });
    });

    after(function () {
      return specHelper.removeBalanceRecord(this[key]);
    });
  },

  addToPurchased(options: {
    userKey?: string;
    balanceRecordKey?: string;
  } = {}) {
    const {
      userKey = 'purchasedUser',
      balanceRecordKey = 'balanceRecord',
    } = options;
    before(function () {
      const { _id: balanceRecordId, ref, refModel } = this[balanceRecordKey];
      return User.updateOne(
        { _id: this[userKey]._id },
        { $push: { purchases: { balanceRecord: balanceRecordId, ref, refModel } } },
      );
    });
  },

  withStubMoleculer(options: {
    serviceNames?: string[];
    stubActions?: Record<string, Function>;
  } = {}) {
    const { serviceNames, stubActions = {} } = options;
    let originalCall: Function;
    before(() => {
      originalCall = moleculerBroker.call;
      sinon
        .stub(moleculerBroker, 'call')
        .callsFake(function (this: MoleculerService, action, ...otherParams) {
          const actionFn = stubActions[action];
          return actionFn
            ? actionFn(...otherParams)
            : originalCall.call(this, action, ...otherParams);
        });
      return moleculerService.startBrokerWithServices(serviceNames);
    });
    after(() => {
      (<SinonMock><unknown>moleculerBroker.call).restore();
      return moleculerService.stopBroker();
    });
  },

  /**
   * Checks if event emitted with checks, or not emitted.
   */
  checkMoleculerEventEmit(
    eventName: string,
    shouldEmit: boolean,
    makeSnapShot?: MakeSnapShotParam,
  ) {
    let moleculerBrokerStub: SinonStub<any>;

    before(() => {
      moleculerBrokerStub = sinon.stub(app.moleculerBroker, 'emit');
    });

    after(() => {
      moleculerBrokerStub.restore();
    });

    if (shouldEmit) {
      it(`should emit event ${eventName}`, () => {
        const callResult = moleculerBrokerStub.withArgs(eventName);
        expect(callResult.callCount).to.be.equal(1);
      });
      if (makeSnapShot) {
        it(makeSnapShot.description || 'event should contain params', function () {
          const callResult = moleculerBrokerStub.withArgs(eventName);
          const eventParams = callResult.args[0][1];
          // eslint-disable-next-line no-restricted-properties
          return makeSnapShot.isForced
            // eslint-disable-next-line no-restricted-properties
            ? specHelper.maskPaths(
              eventParams,
              makeSnapShot.mask || [],
            ).should.isForced.matchSnapshot(this)
            : specHelper.maskPaths(
              eventParams,
              makeSnapShot.mask || [],
            ).should.matchSnapshot(this);
        });
      }
    } else {
      it(`should not emit event ${eventName}`, () => {
        const callResult = moleculerBrokerStub.withArgs(eventName);
        expect(callResult.callCount).to.be.equal(0);
      });
    }
  },

  callMoleculerEventHandler<P>(service: Service, eventName: string, payload: P) {
    const eventMetadata = service._serviceSpecification.events[eventName];
    return expect(eventMetadata).to.exist
      && eventMetadata.handler.call(service, { params: payload });
  },

  checkResponse(
    sendResponse: () => RequestPromise,
    status = 200,
    makeSnapShot?: MakeSnapShotParam,
  ) {
    before('send request', async function () {
      this.response = await sendResponse.call(this);
    });
    it(`should return status ${status}`, function () {
      return expect(this.response.statusCode).to.be.equal(status);
    });
    if (makeSnapShot) {
      it(makeSnapShot.description || 'response should contain body', function () {
        // eslint-disable-next-line no-restricted-properties
        return makeSnapShot.isForced
          // eslint-disable-next-line no-restricted-properties
          ? specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          ).should.isForced.matchSnapshot(this)
          : specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          ).should.matchSnapshot(this);
      });
    }
  },

  checkSocketResponse(
    userSocketKey: string,
    createRequestFn: () => SocketIoRequest,
    status = 200,
    options: {
      beforeFn?: () => Promise<void>,
      makeSnapShot?: MakeSnapShotParam,
    } = {},
  ) {
    if (options.beforeFn) {
      before(options.beforeFn);
    }
    before('send request', function (done) {
      this[userSocketKey].once('restdone', (data: SocketIoTransportData) => {
        this.response = data.result;
        done();
      });
      this[userSocketKey].emit('restdone', createRequestFn.call(this));
    });
    it(`should return status ${status}`, function () {
      return expect(this.response.statusCode).to.be.equal(status);
    });
    if (options.makeSnapShot) {
      const { makeSnapShot } = options;
      // eslint-disable-next-line mocha/no-identical-title
      it(makeSnapShot.description || 'response should contain body', function () {
        // eslint-disable-next-line no-restricted-properties
        return makeSnapShot.isForced
          // eslint-disable-next-line no-restricted-properties
          ? expect(specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          )).isForced.matchSnapshot(this)
          : expect(specHelper.maskPaths(
            this.response.body,
            makeSnapShot.mask || [],
          )).matchSnapshot(this);
      });
    }
  },

  waitFor(precondition: () => boolean): Promise<unknown> {
    return new Promise((resolve) => {
      const tryAgain = () => {
        if (precondition()) {
          resolve();
        } else {
          setTimeout(tryAgain, 200);
        }
      };
      tryAgain();
    });
  },

  prepareDb: async () => {
    await Promise
      .all([
        Album.deleteMany({}),
        BalanceRecord.deleteMany({}),
        Chat.deleteMany({}),
        Comment.deleteMany({}),
        Feedback.deleteMany({}),
        Goal.deleteMany({}),
        LiveStream.deleteMany({}),
        Message.deleteMany({}),
        Notification.deleteMany({}),
        Photo.deleteMany({}),
        RefreshToken.deleteMany({}),
        Report.deleteMany({}),
        Review.deleteMany({}),
        Reward.deleteMany({}),
        Strike.deleteMany({}),
        SystemNotification.deleteMany({}),
        User.deleteMany({ username: { $ne: config.defaultUser.username } }),
        UserConfig.deleteMany({}),
        Video.deleteMany({}),
      ]);
  },

  maskPaths(obj: Record<string, any> | Record<string, any>[], paths: any[]) {
    const MASK_VALUE = '---';
    const mask = (target: Record<string, any>, idx: number) => {
      const result = _.cloneDeep(target);
      paths.forEach((item) => {
        const isObject = !Array.isArray(item) && _.isObject(item);
        const path = isObject ? item.replace : item;
        if (_.get(target, path)) {
          let newFieldValue;
          let newValue = isObject ? item.newValue : undefined;
          if (_.isUndefined(newValue)) {
            newValue = path ? `${path}` : MASK_VALUE;
          }
          if ((!isObject || item.useIdx !== false) && idx !== -1) {
            newValue = `${newValue}[${idx}]`;
          }
          newValue = `$\{${newValue}}`;
          if (isObject) {
            const replacedValue = item.withPath ? _.get(target, item.withPath) : item.withValue;
            newFieldValue = !_.isUndefined(replacedValue)
              ? (_.get(target, path) || '')
                .replace(new RegExp(replacedValue, 'g'), newValue)
              : newValue;
          } else {
            newFieldValue = newValue;
          }
          _.set(result, path, newFieldValue);
        }
      });
      return result;
    };
    return Array.isArray(obj) ? obj.map(mask) : mask(obj, -1);
  },
};

module.exports = specHelper;

export default specHelper;
