"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FIXTURE_TYPES = void 0;
const lodash_1 = __importDefault(require("lodash"));
const request_promise_1 = __importDefault(require("request-promise"));
const socket_io_client_1 = __importDefault(require("socket.io-client"));
const chai_1 = __importDefault(require("chai"));
const chai_as_promised_1 = __importDefault(require("chai-as-promised"));
const chai_things_1 = __importDefault(require("chai-things"));
const sinon_1 = __importDefault(require("sinon"));
const mocha_pro_1 = __importDefault(require("mocha-pro"));
const s3_helper_1 = require("app/lib/s3.helper");
const config_1 = __importDefault(require("test/config"));
const app_1 = __importDefault(require("app"));
const chat_1 = require("../../app/domains/chat");
const liveStream_1 = require("../../app/domains/liveStream");
const strike_1 = require("../../app/domains/strike");
const { config, modelProvider: { Album, BalanceRecord, Chat, Comment, Feedback, Goal, LiveStream, Message, Notification, Photo, RefreshToken, Report, Review, Reward, Strike, SystemNotification, User, UserConfig, Video, }, moleculerBroker, moleculerService, } = app_1.default;
chai_1.default.use(chai_as_promised_1.default);
chai_1.default.use(chai_things_1.default);
chai_1.default.use(mocha_pro_1.default);
chai_1.default.should();
const { expect } = chai_1.default;
// eslint-disable-next-line @typescript-eslint/naming-convention
var FIXTURE_TYPES;
(function (FIXTURE_TYPES) {
    FIXTURE_TYPES["ALBUM"] = "album.data";
    FIXTURE_TYPES["CHAT"] = "chat.data";
    FIXTURE_TYPES["COMMENT"] = "comment.data";
    FIXTURE_TYPES["FEEDBACK"] = "feedback.data";
    FIXTURE_TYPES["GOAL"] = "goal.data";
    FIXTURE_TYPES["LIVE_STREAM"] = "liveStream.data";
    FIXTURE_TYPES["MESSAGE"] = "message.data";
    FIXTURE_TYPES["NOTIFICATION"] = "notification.data";
    FIXTURE_TYPES["PHOTO"] = "photo.data";
    FIXTURE_TYPES["STRIKE_TYPE"] = "strikeType.data";
    FIXTURE_TYPES["REPORT"] = "report.data";
    FIXTURE_TYPES["REWARD"] = "reward.data";
    FIXTURE_TYPES["REVIEW"] = "review.data";
    FIXTURE_TYPES["VIDEO"] = "video.data";
    FIXTURE_TYPES["STRIKE"] = "strike.data";
    FIXTURE_TYPES["SYSTEM_NOTIFICATION"] = "systemNotification.data";
    FIXTURE_TYPES["USER"] = "user.data";
    FIXTURE_TYPES["USER_CONFIG"] = "userConfig.data";
})(FIXTURE_TYPES = exports.FIXTURE_TYPES || (exports.FIXTURE_TYPES = {}));
const clientAuth = {
    client_id: config_1.default.client.id,
    client_secret: config_1.default.client.secret,
};
function assertUserAuth(userData) {
    if (!userData.auth) {
        throw new Error('User should be authenticated');
    }
}
const specHelper = {
    FIXTURE_TYPES,
    get(uri, options) {
        return this.request('GET', uri, undefined, options);
    },
    post(uri, body, options) {
        return this.request('POST', uri, body, options);
    },
    patch(uri, body, options) {
        return this.request('PATCH', uri, body, options);
    },
    put(uri, body, options) {
        return this.request('PUT', uri, body, options);
    },
    delete(uri, body, options) {
        return this.request('DELETE', uri, body, options);
    },
    request(method, uri, body, options) {
        return request_promise_1.default(Object.assign({ method,
            uri,
            body, resolveWithFullResponse: true, simple: false, json: true }, options));
    },
    connectToSocket(options = {}) {
        return new Promise((resolve) => {
            options.extraHeaders = options.extraHeaders || {};
            options.extraHeaders.referer = config_1.default.baseUrl;
            const socket = socket_io_client_1.default.connect(config_1.default.baseUrl, options);
            socket.on('connect', () => {
                resolve(socket);
            });
        });
    },
    getFixture(fixtureType, seed, data) {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        const resolvedRequire = require(`../data/${fixtureType}`);
        const fixtureProvider = (resolvedRequire === null || resolvedRequire === void 0 ? void 0 : resolvedRequire.default) || resolvedRequire;
        let result;
        if (lodash_1.default.isArray(fixtureProvider)) {
            if (lodash_1.default.isUndefined(seed)) {
                seed = Math.floor(Math.random() * fixtureProvider.length);
            }
            else if (!lodash_1.default.isNumber(seed) || seed >= fixtureProvider.length) {
                throw new Error(`Wrong seed value: ${seed}`);
            }
            result = Object.assign({}, fixtureProvider[seed]);
        }
        else if (lodash_1.default.isFunction(fixtureProvider)) {
            seed = seed || Math.floor(Math.random() * 1000000);
            result = fixtureProvider(seed);
        }
        else {
            throw new Error(`Unsupported fixture provider: ${fixtureType}`);
        }
        return Object.assign(result, data || {});
    },
    getClientAuth() {
        return Object.assign({}, clientAuth);
    },
    getBasicAuth(client) {
        const clientId = client ? client.clientId : clientAuth.client_id;
        const clientSecret = client ? client.clientSecret : clientAuth.client_secret;
        return Buffer.from(`${clientId}:${clientSecret}`).toString('base64');
    },
    getDefaultAdminUser() {
        return Object.assign({}, config.defaultUser);
    },
    fetchAndClearSentEmails() {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.get(`${config_1.default.baseUrl}/testing/sent-emails`);
            return result.body;
        });
    },
    createUser(data, login = false) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseUrl}/users`, Object.assign(Object.assign({}, this.getClientAuth()), data));
            data._id = result.body._id;
            if (login) {
                yield this.signInUser(data);
            }
            return result.body;
        });
    },
    signInUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseUrl}/oauth`, Object.assign(Object.assign({ grant_type: 'password' }, lodash_1.default.pick(data, 'username', 'password')), this.getClientAuth()));
            data.auth = {
                access_token: result.body.access_token,
                refresh_token: result.body.refresh_token,
            };
            return result.body;
        });
    },
    banUser(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseAdminUrl}/users/${data._id}/ban`, {}, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    unbanUser(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseAdminUrl}/users/${data._id}/unban`, {}, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    openChat(socket, data) {
        return new Promise((resolve, reject) => {
            socket.once('restdone', (result) => {
                const response = result.result;
                if (response.statusCode === 200) {
                    data._id = response.body._id;
                    resolve(data);
                }
                else {
                    reject(new Error(`Wrong status code ${response.statusCode}`));
                }
            });
            socket.emit('restdone', {
                route: 'put:/chats/:chatType/with/:typeParam',
                params: {
                    chatType: chat_1.ChatType.Private,
                    user: data.user,
                    typeParam: data.typeParam,
                },
            });
        });
    },
    addUserSubscribers(userData, subscriberUserData) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                User.updateOne({
                    _id: userData._id,
                }, {
                    $push: { subscribers: subscriberUserData._id },
                }),
                User.updateOne({
                    _id: subscriberUserData._id,
                }, {
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
                }),
            ]);
        });
    },
    removeUserSubscribers(userData, subscriberUserData) {
        return __awaiter(this, void 0, void 0, function* () {
            return Promise.all([
                User.updateOne({
                    _id: userData._id,
                }, {
                    $pull: { subscribers: subscriberUserData._id },
                }),
                User.updateOne({
                    _id: subscriberUserData._id,
                }, {
                    $pull: {
                        subscriptions: {
                            targetUser: userData._id,
                        },
                    },
                }),
            ]);
        });
    },
    getUser(adminUserData, data, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(adminUserData);
            data = data || adminUserData;
            userId = userId || data._id;
            const result = yield this.get(`${config_1.default.baseUrl}/users/${userId}`, { headers: { Authorization: `Bearer ${adminUserData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    resetUserBalance(balance = 0, key = 'user') {
        before(function () {
            return User.updateOne({ _id: this[key]._id }, { balance });
        });
    },
    removeUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && User.deleteOne({ _id: data._id });
        });
    },
    removeFile(filename) {
        return __awaiter(this, void 0, void 0, function* () {
            yield s3_helper_1.deleteObjects(filename);
        });
    },
    createChat(userData, otherUserData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.put(`${config_1.default.baseUrl}/users/me/chats/${otherUserData._id}`, {}, { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    getChat(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.get(`${config_1.default.baseUrl}/users/me/chats/${data._id}`, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    removeChat(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data._id) {
                return Chat.deleteOne({ _id: data._id });
            }
            else {
                return null;
            }
        });
    },
    createMessage(socket, chatId, data) {
        return new Promise((resolve, reject) => {
            socket.once('restdone', (payload) => {
                const response = payload.result;
                if (response.statusCode === 201) {
                    data._id = response.body._id;
                    resolve(data);
                }
                else {
                    reject(new Error(`Wrong status code ${response.statusCode}`));
                }
            });
            socket.emit('restdone', {
                route: 'post:/chats/:chat/messages',
                params: { chat: chatId },
                body: data,
            });
        });
    },
    getMessage(userData, chat, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.get(`${config_1.default.baseUrl}/chats/${chat._id}/messages/${data._id}`, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    banMessage(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseAdminUrl}/messages/${data._id}/ban`, {
                banningReasonType: strike_1.StrikeType.Spam,
            }, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    unbanMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Message.unban(data._id);
        });
    },
    removeMessage(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data._id) {
                return Message.deleteOne({ _id: data._id });
            }
            else {
                return null;
            }
        });
    },
    createLiveStream(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/users/${userData._id}/live-streams`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    startLiveStream(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.put(`${config_1.default.baseUrl}/users/${userData._id}/live-streams/${data._id}`, {}, { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            return result.body;
        });
    },
    removeLiveStream(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && LiveStream.deleteOne({ _id: data._id });
        });
    },
    createComment(userData, liveStreamData, commentData) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/live-streams/${liveStreamData._id}/comments`, Object.assign({}, commentData), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            commentData._id = result.body._id;
            return result.body;
        });
    },
    removeComment(comment) {
        return __awaiter(this, void 0, void 0, function* () {
            return comment._id && Comment.deleteOne({ _id: comment._id });
        });
    },
    createAlbum(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/users/${userData._id}/albums`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    banAlbum(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseAdminUrl}/albums/${data._id}/ban`, {
                banningReasonType: strike_1.StrikeType.Spam,
            }, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    unbanAlbum(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Album.unban(data._id);
        });
    },
    removeAlbum(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Album.deleteOne({ _id: data._id });
        });
    },
    createPhoto(userData, albumData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/albums/${albumData._id}/photos`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    banPhoto(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseAdminUrl}/photos/${data._id}/ban`, {
                banningReasonType: strike_1.StrikeType.Spam,
            }, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    unbanPhoto(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Photo.unban(data._id);
        });
    },
    removePhoto(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Photo.deleteOne({ _id: data._id });
        });
    },
    createReward(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/rewards`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeReward(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Reward.deleteOne({ _id: data._id });
        });
    },
    createReview(userData, targetUserData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/users/${targetUserData._id}/reviews`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeReview(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Review.deleteOne({ _id: data._id });
        });
    },
    withReview(options) {
        const { data, key = 'review', userKey = 'user', targetUserKey = 'targetUser' } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.REVIEW);
                yield specHelper.createReview(this[userKey], this[targetUserKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeReview(this[key]);
        });
    },
    createVideo(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/users/${userData._id}/videos`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    banVideo(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseAdminUrl}/videos/${data._id}/ban`, {
                banningReasonType: strike_1.StrikeType.Spam,
            }, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    unbanVideo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Video.unban(data._id);
        });
    },
    removeVideo(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Video.deleteOne({ _id: data._id });
        });
    },
    createSystemNotification(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/system-notifications`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeSystemNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && SystemNotification.deleteOne({ _id: data._id });
        });
    },
    createNotification(data, recipientsData) {
        return __awaiter(this, void 0, void 0, function* () {
            const recipients = recipientsData ? recipientsData.map(({ _id }) => _id) : [];
            const readable = recipients.length > 0;
            Object.assign(data, { recipients, readable });
            const notification = yield Notification.create(data);
            Object.assign(data, notification.toJSON());
        });
    },
    getNotifications(userData) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.get(`${config_1.default.baseUrl}/users/${userData._id}/notifications`, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    getNotification(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.get(`${config_1.default.baseUrl}/users/${userData._id}/notifications/${data._id}`, {
                headers: {
                    Authorization: `Bearer ${userData.auth.access_token}`,
                },
            });
            return result.body;
        });
    },
    getNotificationFromDb(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return Notification.findOne({ _id: data._id });
        });
    },
    removeNotification(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Notification.deleteOne({ _id: data._id });
        });
    },
    removeAllNotifications() {
        return __awaiter(this, void 0, void 0, function* () {
            return Notification.deleteMany({});
        });
    },
    createStrike(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/admin/strikes`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeStrike(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Strike.deleteOne({ _id: data._id });
        });
    },
    withStrike(options) {
        const { data, key = 'strike', seed, creatorKey = 'adminUser', refKey, refModel, targetUserKey = 'user', } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.STRIKE, seed);
                if (refKey) {
                    this[key].ref = this[refKey]._id;
                }
                if (refModel) {
                    this[key].refModel = refModel;
                }
                this[key].targetUser = this[targetUserKey]._id;
                yield specHelper.createStrike(this[creatorKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeStrike(this[key]);
        });
    },
    createGoal(userResource, liveStreamResource, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.post(`${config_1.default.baseUrl}/live-streams/${liveStreamResource._id}/goals`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userResource.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeGoal(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Goal.deleteOne({ _id: data._id });
        });
    },
    withGoal(options) {
        const { data, extraData, key = 'goal', liveStreamKey = 'liveStream', seed, userKey = 'user', } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.GOAL, seed, extraData);
                yield specHelper.createGoal(this[userKey], this[liveStreamKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeGoal(this[key]);
        });
    },
    createFeedback(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/users/${userData._id}/feedbacks`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeFeedback(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && Feedback.deleteOne({ _id: data._id });
        });
    },
    withFeedback(options) {
        const { data, key = 'feedback', seed, userKey = 'user', } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.FEEDBACK, seed);
                yield specHelper.createFeedback(this[userKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeFeedback(this[key]);
        });
    },
    createReport(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const result = yield this.post(`${config_1.default.baseUrl}/users/me/reports`, Object.assign({}, data), { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeReport(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data._id) {
                return Report.deleteOne({ _id: data._id });
            }
            else {
                return null;
            }
        });
    },
    createUserConfig(userData, data) {
        return __awaiter(this, void 0, void 0, function* () {
            assertUserAuth(userData);
            const { key } = data, body = __rest(data, ["key"]);
            const result = yield this.put(`${config_1.default.baseUrl}/users/me/configs/${key}`, body, { headers: { Authorization: `Bearer ${userData.auth.access_token}` } });
            data._id = result.body._id;
            return result.body;
        });
    },
    removeUserConfig(data) {
        return __awaiter(this, void 0, void 0, function* () {
            if (data._id) {
                return UserConfig.deleteOne({ _id: data._id });
            }
            else {
                return null;
            }
        });
    },
    withAdminUser(adminUserData = config.defaultUser) {
        before(function () {
            this.adminUser = lodash_1.default.cloneDeep(adminUserData);
            return specHelper.signInUser(this.adminUser);
        });
    },
    withUser(options = {}) {
        const { data, key = 'user', login = true, seed } = options;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, seed);
                yield specHelper.createUser(this[key], login);
            });
        });
        after(function () {
            return specHelper.removeUser(this[key]);
        });
    },
    withUserSocket(options = {}) {
        const { data, key = 'userSocket', userKey = 'user', seed, shouldWithUser = true } = options;
        if (shouldWithUser) {
            specHelper.withUser({
                data,
                key: userKey,
                login: true,
                seed,
            });
        }
        before('open socket for user', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = yield specHelper.connectToSocket({
                    extraHeaders: {
                        Authorization: `Bearer ${this[userKey].auth.access_token}`,
                    },
                });
            });
        });
    },
    withChat(options) {
        const { data, key = 'chat', typeParamKey = 'otherUser', userKey = 'user', userSocketKey = 'userSocket', } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.CHAT);
                Object.assign(this[key], {
                    user: this[userKey]._id,
                    typeParam: this[typeParamKey]._id,
                });
                return specHelper.openChat(this[userSocketKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeChat(this[key]);
        });
    },
    withSocketHandler(options) {
        const { eventName, key = 'userSocket', resultKey = 'socketEventData', shouldBeSilent, timeout = 500, makeSnapShot, } = options;
        let timeoutHandler;
        let done = false;
        let socketEventData;
        let wasTimeout = false;
        before(function () {
            this[key].once(eventName, (result) => {
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
        it(shouldBeSilent ? 'should not fire' : 'should fire', () => __awaiter(this, void 0, void 0, function* () {
            if (!done) {
                yield new Promise((resolve) => {
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
            }
            else {
                return expect(wasTimeout).to.be.false;
            }
        }));
        if (makeSnapShot && !wasTimeout) {
            it('response should match', function () {
                // eslint-disable-next-line no-restricted-properties
                return makeSnapShot.isForced
                    // eslint-disable-next-line no-restricted-properties
                    ? expect(specHelper.maskPaths(socketEventData, makeSnapShot.mask || [])).isForced.matchSnapshot(this)
                    : expect(specHelper.maskPaths(socketEventData, makeSnapShot.mask || [])).matchSnapshot(this);
            });
        }
    },
    withAlbum(options) {
        const { data, extraData, key = 'album', seed, userKey = 'user', } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.ALBUM, seed, extraData);
                yield specHelper.createAlbum(this[userKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeAlbum(this[key]);
        });
    },
    withSystemNotification(options) {
        const { data, key = 'systemNotification', userKey = 'adminUser' } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.SYSTEM_NOTIFICATION, 1, 'Testing');
                yield specHelper.createSystemNotification(this[userKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeSystemNotification(this[key]);
        });
    },
    withComment(options) {
        const { data, key = 'comment', liveStreamKey = 'liveStream', userKey = 'user' } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.COMMENT);
                yield specHelper.createComment(this[userKey], this[liveStreamKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeComment(this[key]);
        });
    },
    withLiveStream(options) {
        const { data, extraData, key = 'liveStream', seed, shouldMakeOnAir = false, userKey = 'user', } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.LIVE_STREAM, seed, extraData);
                yield specHelper.createLiveStream(this[userKey], this[key]);
                if (shouldMakeOnAir) {
                    yield LiveStream.updateOne({ _id: this[key]._id }, { state: liveStream_1.LiveStreamState.OnAir });
                }
            });
        });
        after(function () {
            return specHelper.removeLiveStream(this[key]);
        });
    },
    withPhoto(options) {
        const { data, key = 'photo', albumKey = 'album', userKey = 'user', } = options || {};
        before(function () {
            this[key] = data
                ? lodash_1.default.cloneDeep(data)
                : specHelper.getFixture(specHelper.FIXTURE_TYPES.PHOTO);
            return specHelper.createPhoto(this[userKey], this[albumKey], this[key]);
        });
        after(function () {
            return specHelper.removePhoto(this[key]);
        });
    },
    withVideo(options) {
        const { data, extraData, key = 'video', seed, userKey = 'user', } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.VIDEO, seed, extraData);
                yield specHelper.createVideo(this[userKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeVideo(this[key]);
        });
    },
    withReport(options) {
        const { data, key = 'report', userKey = 'user' } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.REPORT);
                yield specHelper.createReport(this[userKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeReport(this[key]);
        });
    },
    withUserConfig(options) {
        const { data, key = 'userConfig', userKey = 'user' } = options || {};
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = data
                    ? lodash_1.default.cloneDeep(data)
                    : specHelper.getFixture(specHelper.FIXTURE_TYPES.USER_CONFIG);
                yield specHelper.createUserConfig(this[userKey], this[key]);
            });
        });
        after(function () {
            return specHelper.removeUserConfig(this[key]);
        });
    },
    removeBalanceRecord(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return data._id && BalanceRecord.deleteOne({ _id: data._id });
        });
    },
    withBalanceRecord(options) {
        const { key = 'balanceRecord', type, sum = 1, refKey, refModel, ownerKey = 'user', } = options;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                this[key] = yield BalanceRecord.create({
                    owner: this[ownerKey],
                    type,
                    sum,
                    ref: refKey ? this[refKey]._id : undefined,
                    refModel,
                });
            });
        });
        after(function () {
            return specHelper.removeBalanceRecord(this[key]);
        });
    },
    addToPurchased(options = {}) {
        const { userKey = 'purchasedUser', balanceRecordKey = 'balanceRecord', } = options;
        before(function () {
            const { _id: balanceRecordId, ref, refModel } = this[balanceRecordKey];
            return User.updateOne({ _id: this[userKey]._id }, { $push: { purchases: { balanceRecord: balanceRecordId, ref, refModel } } });
        });
    },
    withStubMoleculer(options = {}) {
        const { serviceNames, stubActions = {} } = options;
        let originalCall;
        before(() => {
            originalCall = moleculerBroker.call;
            sinon_1.default
                .stub(moleculerBroker, 'call')
                .callsFake(function (action, ...otherParams) {
                const actionFn = stubActions[action];
                return actionFn
                    ? actionFn(...otherParams)
                    : originalCall.call(this, action, ...otherParams);
            });
            return moleculerService.startBrokerWithServices(serviceNames);
        });
        after(() => {
            moleculerBroker.call.restore();
            return moleculerService.stopBroker();
        });
    },
    /**
     * Checks if event emitted with checks, or not emitted.
     */
    checkMoleculerEventEmit(eventName, shouldEmit, makeSnapShot) {
        let moleculerBrokerStub;
        before(() => {
            moleculerBrokerStub = sinon_1.default.stub(app_1.default.moleculerBroker, 'emit');
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
                        ? specHelper.maskPaths(eventParams, makeSnapShot.mask || []).should.isForced.matchSnapshot(this)
                        : specHelper.maskPaths(eventParams, makeSnapShot.mask || []).should.matchSnapshot(this);
                });
            }
        }
        else {
            it(`should not emit event ${eventName}`, () => {
                const callResult = moleculerBrokerStub.withArgs(eventName);
                expect(callResult.callCount).to.be.equal(0);
            });
        }
    },
    callMoleculerEventHandler(service, eventName, payload) {
        const eventMetadata = service._serviceSpecification.events[eventName];
        return expect(eventMetadata).to.exist
            && eventMetadata.handler.call(service, { params: payload });
    },
    checkResponse(sendResponse, status = 200, makeSnapShot) {
        before('send request', function () {
            return __awaiter(this, void 0, void 0, function* () {
                this.response = yield sendResponse.call(this);
            });
        });
        it(`should return status ${status}`, function () {
            return expect(this.response.statusCode).to.be.equal(status);
        });
        if (makeSnapShot) {
            it(makeSnapShot.description || 'response should contain body', function () {
                // eslint-disable-next-line no-restricted-properties
                return makeSnapShot.isForced
                    // eslint-disable-next-line no-restricted-properties
                    ? specHelper.maskPaths(this.response.body, makeSnapShot.mask || []).should.isForced.matchSnapshot(this)
                    : specHelper.maskPaths(this.response.body, makeSnapShot.mask || []).should.matchSnapshot(this);
            });
        }
    },
    checkSocketResponse(userSocketKey, createRequestFn, status = 200, options = {}) {
        if (options.beforeFn) {
            before(options.beforeFn);
        }
        before('send request', function (done) {
            this[userSocketKey].once('restdone', (data) => {
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
                    ? expect(specHelper.maskPaths(this.response.body, makeSnapShot.mask || [])).isForced.matchSnapshot(this)
                    : expect(specHelper.maskPaths(this.response.body, makeSnapShot.mask || [])).matchSnapshot(this);
            });
        }
    },
    waitFor(precondition) {
        return new Promise((resolve) => {
            const tryAgain = () => {
                if (precondition()) {
                    resolve();
                }
                else {
                    setTimeout(tryAgain, 200);
                }
            };
            tryAgain();
        });
    },
    prepareDb: () => __awaiter(void 0, void 0, void 0, function* () {
        yield Promise
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
    }),
    maskPaths(obj, paths) {
        const MASK_VALUE = '---';
        const mask = (target, idx) => {
            const result = lodash_1.default.cloneDeep(target);
            paths.forEach((item) => {
                const isObject = !Array.isArray(item) && lodash_1.default.isObject(item);
                const path = isObject ? item.replace : item;
                if (lodash_1.default.get(target, path)) {
                    let newFieldValue;
                    let newValue = isObject ? item.newValue : undefined;
                    if (lodash_1.default.isUndefined(newValue)) {
                        newValue = path ? `${path}` : MASK_VALUE;
                    }
                    if ((!isObject || item.useIdx !== false) && idx !== -1) {
                        newValue = `${newValue}[${idx}]`;
                    }
                    newValue = `$\{${newValue}}`;
                    if (isObject) {
                        const replacedValue = item.withPath ? lodash_1.default.get(target, item.withPath) : item.withValue;
                        newFieldValue = !lodash_1.default.isUndefined(replacedValue)
                            ? (lodash_1.default.get(target, path) || '')
                                .replace(new RegExp(replacedValue, 'g'), newValue)
                            : newValue;
                    }
                    else {
                        newFieldValue = newValue;
                    }
                    lodash_1.default.set(result, path, newFieldValue);
                }
            });
            return result;
        };
        return Array.isArray(obj) ? obj.map(mask) : mask(obj, -1);
    },
};
module.exports = specHelper;
exports.default = specHelper;
//# sourceMappingURL=specHelper.js.map