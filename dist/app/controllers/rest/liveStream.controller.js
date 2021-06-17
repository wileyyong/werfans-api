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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const moment_1 = __importDefault(require("moment"));
const app_1 = __importDefault(require("app"));
const http_status_node_1 = __importDefault(require("http-status-node"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const array_with_counter_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/array-with-counter.restdone.plugin"));
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const liveStream_1 = require("../../domains/liveStream");
const notification_1 = require("../../domains/notification");
const inc_field_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/inc-field.restdone.plugin"));
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const balanceRecordRefModel_1 = require("../../domains/balanceRecordRefModel");
const balanceRecord_1 = require("../../domains/balanceRecord");
const { consts: { events, RULES: { INVALID_STATE_TRANSITION, MANDATORY_PARAM_IS_MISSING, NOT_ENOUGH_BALANCE, NOT_SALABLE, }, }, modelProvider: { Chat, LiveStream, User, }, paymentService, } = app_1.default;
const SUBSCRIBED_ONLY_FIELDS = ['url'];
/**
 * @swagger
 *
 * /live-streams/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - LiveStreams
 *     summary: Returns live-stream by _id
 *     operationId: getLiveStreams
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns live-stream by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/LiveStreamModelResponseList'
 * /users/{userId}/live-streams:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - LiveStreams
 *     summary: Returns array of live-streams of the specified user
 *     operationId: getUserLiveStreams
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id, 'me' accepted too
 *     responses:
 *       '200':
 *         description: returns user's live-streams
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LiveStreamModelResponseList'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - LiveStreams
 *     summary: Creates a live-stream
 *     operationId: createLiveStream
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/LiveStreamModel'
 *     responses:
 *       '201':
 *         description: returns created live-streams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/LiveStreamModelResponseCreated'
 * /users/{userId}/live-streams/{liveStreamId}:
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - LiveStreams
 *     summary: Updates live-stream by _id
 *     operationId: updateLiveStream
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id, 'me' accepted too
 *       - in: path
 *         name: liveStreamId
 *         description: liveStream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: liveStream _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/LiveStreamModel'
 *     responses:
 *       '200':
 *         description: returns updated live-streams
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/LiveStreamModelResponseList'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - LiveStreams
 *     summary: Removes live-stream by _id. Live-stream must be owned by user or admin
 *     operationId: deleteUserLiveStream
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id, 'me' accepted too
 *       - in: path
 *         name: liveStreamId
 *         description: liveStream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: liveStream _id
 *     responses:
 *       '204':
 *         description: Empty response
 * /live-streams/{livestreamId}/liked-users:
 *   get:
 *     tags:
 *       - LiveStreams
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get liked users
 *     operationId: GetLikedUsers
 *     parameters:
 *       - name: livestreamId
 *         description: liveStream _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: return a user object
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   type:
 *                     type: string
 * /live-streams/{livestreamId}/liked-users/{userId}:
 *   put:
 *     tags:
 *       - LiveStreams
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: put liked users
 *     operationId: PutLikedUsers
 *     parameters:
 *       - name: livestreamId
 *         description: liveStream _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: return a list of liked users ids
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   type:
 *                     type: string
 *   delete:
 *     tags:
 *       - LiveStreams
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: delete liked users
 *     operationId: DeleteLikedUsers
 *     parameters:
 *       - name: livestreamId
 *         description: liveStream _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Empty response
 * /live-streams/{userId}/favorited:
 *   get:
 *     tags:
 *       - LiveStreams
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get user's favorites livestreams
 *     operationId: findFavoriteLiveStreamsForUser
 *     parameters:
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: return a list of liveStreams objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/LiveStreamModelResponseList'
 * /live-streams/{livestreamId}/favorites:
 *   get:
 *     tags:
 *       - LiveStreams
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get users who added to favorites
 *     operationId: GetLiveStreamUsersInFavorites
 *     parameters:
 *       - name: livestreamId
 *         description: liveStream _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: return a list of users object
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   type:
 *                     type: string
 * /live-streams/{livestreamId}/favorites/{userId}:
 *   put:
 *     tags:
 *       - LiveStreams
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: put to favorites
 *     operationId: AddLiveStreamToFavorites
 *     parameters:
 *       - name: livestreamId
 *         description: liveStream _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: return a list of users who added liveStream to favorites
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   _id:
 *                     type: string
 *                   username:
 *                     type: string
 *                   type:
 *                     type: string
 *   delete:
 *     tags:
 *       - LiveStreams
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: delete from favorites
 *     operationId: DeleteLiveStreamFromFavorites
 *     parameters:
 *       - name: livestreamId
 *         description: liveStream _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Empty response
 *
 * /live-streams/{_id}/purchase:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - LiveStreams
 *     summary: Purchases a liveStream
 *     operationId: liveStreamsPurchase
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: liveStream id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: returns sum
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sum:
 *                   type: number
 *
 */
class LiveStreamController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: LiveStream,
                },
            },
            path: ['/live-streams', '/users/:owner/live-streams'],
            fields: [
                'duration',
                'price',
                'coverUrl',
                'url',
                'publicUrl',
                {
                    name: 'owner',
                    fields: [
                        'username',
                        'avatarUrl',
                    ],
                },
                'state',
                {
                    name: 'likedUsers',
                    fields: [
                        'username',
                        'type',
                        'avatarUrl',
                    ],
                },
                'likedUsersCounter',
                'viewersCounter',
                'viewsCounter',
                {
                    name: 'favoritedUsers',
                    fields: [
                        'username',
                        'type',
                        'avatarUrl',
                    ],
                },
                'favoritedUsersCounter',
                'scheduledStartingAt',
                'scheduledAt',
                'startedAt',
                'stoppedAt',
                'createdAt',
                'updatedAt',
            ],
            readOnlyFields: [
                'duration',
                'publicUrl',
                'state',
                'likedUsers',
                'likedUsersCounter',
                'viewersCounter',
                'viewsCounter',
                'favoritedUsers',
                'favoritedUsersCounter',
                'scheduledStartingAt',
                'scheduledAt',
                'startedAt',
                'stoppedAt',
                'createdAt',
                'updatedAt',
            ],
            actions: {
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
                /**
                 * @swagger
                 * /live-streams/{liveStreamId}/schedule:
                 *   put:
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     tags:
                 *       - LiveStreams
                 *     summary: Schedules the live stream
                 *     operationId: scheduleLiveStream
                 *     parameters:
                 *       - in: path
                 *         name: liveStreamId
                 *         description: live stream _id
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: live stream _id
                 *     requestBody:
                 *       required: true
                 *       content:
                 *         application/json:
                 *           schema:
                 *             type: object
                 *             properties:
                 *               scheduledStartingAt:
                 *                 type: string
                 *                 description: Planning start time
                 *             required:
                 *               - url
                 *     responses:
                 *       '200':
                 *         description: LiveStream Resource
                 *         content:
                 *           application/json:
                 *             schema:
                 *               type: object
                 *               $ref: '#/components/schemas/LiveStreamModelResponseList'
                 */
                schedule: base_restdone_controller_1.default.createAction({
                    method: 'put',
                    path: ':_id/schedule',
                    priority: -1,
                }),
                /**
                 * @swagger
                 * /live-streams/{liveStreamId}/start:
                 *   put:
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     tags:
                 *       - LiveStreams
                 *     summary: Starts the live stream
                 *     operationId: startLiveStream
                 *     parameters:
                 *       - in: path
                 *         name: liveStreamId
                 *         description: live stream _id
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: live stream _id
                 *     requestBody:
                 *       required: true
                 *       content:
                 *         application/json:
                 *           schema:
                 *             type: object
                 *             properties:
                 *               url:
                 *                 type: string
                 *                 description: liveStream url
                 *             required:
                 *               - url
                 *     responses:
                 *       '200':
                 *         description: LiveStream Resource
                 *         content:
                 *           application/json:
                 *             schema:
                 *               type: object
                 *               $ref: '#/components/schemas/LiveStreamModelResponseList'
                 */
                start: base_restdone_controller_1.default.createAction({
                    method: 'put',
                    path: ':_id/start',
                    priority: -1,
                }),
                /**
                 * @swagger
                 * /live-streams/{liveStreamId}/stop:
                 *   put:
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     tags:
                 *       - LiveStreams
                 *     summary: Stops the live stream
                 *     operationId: stopLiveStream
                 *     parameters:
                 *       - in: path
                 *         name: liveStreamId
                 *         description: live stream _id
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: live stream _id
                 *     responses:
                 *       '200':
                 *         description: LiveStream Resource
                 *         content:
                 *           application/json:
                 *             schema:
                 *               type: object
                 *               $ref: '#/components/schemas/LiveStreamModelResponseList'
                 */
                stop: base_restdone_controller_1.default.createAction({
                    method: 'put',
                    path: ':_id/stop',
                    priority: -1,
                }),
                purchase: base_restdone_controller_1.default.createAction({
                    method: 'post',
                    path: ':_id/purchase',
                }),
                findFavoriteLiveStreamsForUser: base_restdone_controller_1.default.createAction({
                    method: 'get',
                    path: ':_id/favorited',
                }),
            },
            plugins: [
                {
                    plugin: array_with_counter_restdone_plugin_1.default.restdone,
                    options: {
                        Model: LiveStream,
                        array: 'favoritedUsers',
                        path: 'favorites',
                        pre(scope) {
                            return __awaiter(this, void 0, void 0, function* () {
                                const { params, user } = scope;
                                if (!user) {
                                    throw new Error('Wrong auth');
                                }
                                if (params.itemId === 'me') {
                                    params.itemId = user.id;
                                }
                                if (params.itemId && user.id !== params.itemId) {
                                    throw http_status_node_1.default.FORBIDDEN.createError('You can use only own ID here');
                                }
                            });
                        },
                        afterPut(model, scope) {
                            return __awaiter(this, void 0, void 0, function* () {
                                const { params } = scope;
                                const liveStream = yield LiveStream.findOne({ _id: model._id }).lean();
                                if (liveStream)
                                    yield User.updateOne({ _id: liveStream.owner }, { $addToSet: { favoritedUsers: params.itemId } });
                            });
                        },
                    },
                },
                {
                    plugin: array_with_counter_restdone_plugin_1.default.restdone,
                    options: {
                        Model: LiveStream,
                        array: 'likedUsers',
                        path: 'liked-users',
                        pre(scope) {
                            const { params } = scope;
                            const user = this.getUserStrict(scope);
                            if (params.itemId === 'me') {
                                params.itemId = user.id;
                            }
                            if (params.itemId && user.id !== params.itemId) {
                                throw http_status_node_1.default.FORBIDDEN.createError('You can use only own ID here');
                            }
                        },
                    },
                },
                {
                    plugin: array_with_counter_restdone_plugin_1.default.restdone,
                    options: {
                        Model: LiveStream,
                        array: 'viewers',
                        path: 'viewers',
                        allowDelete: false,
                        pre(scope) {
                            const { params } = scope;
                            const user = this.getUserStrict(scope);
                            if (params.itemId === 'me') {
                                params.itemId = user.id;
                            }
                            if (params.itemId && user.id !== params.itemId) {
                                throw http_status_node_1.default.FORBIDDEN.createError('You can use only own ID here');
                            }
                        },
                    },
                },
                /**
                 * @swagger
                 * /live-streams/{liveStreamId}/inc/viewsCounter:
                 *   post:
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     tags:
                 *       - LiveStreams
                 *     summary: Increments views counter for a live stream
                 *     operationId: increaseLiveStreamViewsCounter
                 *     parameters:
                 *       - in: path
                 *         name: liveStreamId
                 *         description: live stream _id
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: live stream _id
                 *     responses:
                 *       '204':
                 *         description: Empty response
                 */
                {
                    plugin: inc_field_restdone_plugin_1.default.restdone,
                    options: {
                        model: LiveStream,
                        field: 'viewsCounter',
                        extraFieldNames: 'owner',
                        afterInc(scope, resource) {
                            return User.incViewsCounter(resource.owner);
                        },
                    },
                },
                {
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                    options: {
                        field: 'owner',
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, params: { owner } } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isSelect() && !params.owner) {
                params.owner = currentUser.id;
            }
            if (!scope.isSelect() && !currentUser.isAdmin()) {
                if (!owner) {
                    params.owner = currentUser.id;
                }
                else if (owner !== currentUser.id) {
                    throw http_status_node_1.default.FORBIDDEN.createError();
                }
            }
        });
    }
    queryPipe(query, scope) {
        if (scope.isSelect()) {
            if (scope.fieldList.likedUsers) {
                query.slice('likedUsers', -20);
            }
            if (scope.fieldList.favoritedUsers) {
                query.slice('favoritedUsers', -20);
            }
        }
    }
    schedule(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body: { scheduledStartingAt } } = scope;
            if (!scheduledStartingAt) {
                throw createAppError_1.default(MANDATORY_PARAM_IS_MISSING);
            }
            yield this.pre(scope);
            if (moment_1.default(scheduledStartingAt).subtract(1, 'hour').isBefore()) {
                throw http_status_node_1.default.BAD_REQUEST.createError('scheduledStartingAt should be an hour after the current time');
            }
            const liveStream = (yield this.locateModel(scope));
            this.changeLiveStreamState(liveStream, liveStream_1.LiveStreamState.Scheduled);
            liveStream.scheduledStartingAt = scheduledStartingAt;
            liveStream.scheduledAt = new Date();
            yield liveStream.save();
            const recipients = yield User.getSubscribersOf(liveStream.owner);
            yield app_1.default.notificationService.createNotification({
                notificationType: notification_1.NotificationType.LiveStreamScheduled,
                body: 'LiveStream scheduled',
                metadata: {
                    liveStream: liveStream._id,
                    scheduledStartingAt: liveStream.scheduledStartingAt,
                    // @ts-ignore
                    owner: liveStream.owner.toJSON(),
                },
                recipients,
            });
            return liveStream;
        });
    }
    start(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body: { url } } = scope;
            if (!url) {
                throw createAppError_1.default(MANDATORY_PARAM_IS_MISSING);
            }
            yield this.pre(scope);
            const liveStream = (yield this.locateModel(scope));
            this.changeLiveStreamState(liveStream, liveStream_1.LiveStreamState.OnAir);
            liveStream.url = url;
            liveStream.publicUrl = url;
            liveStream.startedAt = new Date();
            yield liveStream.save();
            const recipients = yield User.getSubscribersOf(liveStream.owner);
            yield app_1.default.notificationService.createNotification({
                notificationType: notification_1.NotificationType.LiveStreamStarted,
                body: 'LiveStream started',
                metadata: {
                    liveStream: liveStream._id,
                    // @ts-ignore
                    owner: liveStream.owner.toJSON(),
                },
                recipients,
            });
            return liveStream;
        });
    }
    stop(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pre(scope);
            const liveStream = (yield this.locateModel(scope));
            this.changeLiveStreamState(liveStream, liveStream_1.LiveStreamState.Completed);
            liveStream.stoppedAt = new Date();
            yield liveStream.save();
            app_1.default.moleculerBroker.emit(events.liveStreams.completed, {
                _id: liveStream.id,
            });
            return liveStream;
        });
    }
    purchase(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.getUserStrict(scope);
            const liveStream = yield LiveStream.findById(scope.params._id).lean();
            if (!liveStream) {
                throw http_status_node_1.default.NOT_FOUND.createError();
            }
            const { _id: contentId, price } = liveStream;
            if (!price) {
                throw createAppError_1.default(NOT_SALABLE);
            }
            const result = yield paymentService.processRecord({
                owner: user._id,
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                ref: contentId,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.LiveStream,
                sum: -1 * price,
            });
            if (!result) {
                throw createAppError_1.default(NOT_ENOUGH_BALANCE);
            }
            return { sum: price };
        });
    }
    findFavoriteLiveStreamsForUser(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, user: currentUser } = scope;
            if (!currentUser) {
                throw new Error('No user');
            }
            const userId = params._id === 'me' ? currentUser.id : params._id;
            const livestreams = yield LiveStream.findFavoriteLiveStreamsForUser(userId);
            return livestreams;
        });
    }
    assignFilter(queryParams, fieldName, scope) {
        const { user } = scope;
        // do not allow not-admins update owner
        if (fieldName === 'owner' && scope.isUpdate() && !(user === null || user === void 0 ? void 0 : user.isAdmin())) {
            return false;
        }
        return super.assignFilter(queryParams, fieldName, scope);
    }
    beforeSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body: { url }, model } = scope;
            if (scope.isInsert()) {
                // TODO: Integrate with video processing
                model.duration = -1;
                yield Chat.createLiveStream(model._id, model.owner);
            }
            if (scope.model.isModified('url')) {
                model.publicUrl = url;
            }
        });
    }
    post(resource, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return (scope.isSelectOne()
                ? this.applySubscriptionRules([resource], scope.user)[0]
                : resource);
        });
    }
    collectionPost(list, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.applySubscriptionRules(list, scope.user);
        });
    }
    applySubscriptionRules(list, user) {
        return list.map((item) => (user.isSubscribedTo(item.owner._id)
            || user.hasPurchasedContent(balanceRecordRefModel_1.BalanceRecordRefModel.LiveStream, item._id)
            ? item
            : lodash_1.default.omit(item, ...SUBSCRIBED_ONLY_FIELDS)));
    }
    changeLiveStreamState(liveStream, newState) {
        if (!liveStream.changeState(newState)) {
            throw createAppError_1.default(INVALID_STATE_TRANSITION, { currentState: liveStream.state, newState });
        }
    }
}
exports.default = LiveStreamController;
//# sourceMappingURL=liveStream.controller.js.map