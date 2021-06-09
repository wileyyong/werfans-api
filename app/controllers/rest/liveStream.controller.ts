import _ from 'lodash';
import moment from 'moment';
import { DocumentQuery } from 'mongoose';
import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import createAppError from 'app/lib/createAppError';
import { LiveStreamDocument, LiveStreamDomain, LiveStreamResource, LiveStreamState } from '../../domains/liveStream';
import { Scope } from '../../domains/app';
import { NotificationType } from '../../domains/notification';
import { UserDocument } from '../../domains/user';
import incFieldRestdonePlugin from '../../lib/restdone.plugin/inc-field.restdone.plugin';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';
import { LiveStreamCompleted } from '../../domains/molecules';
import { BalanceRecordRefModel } from '../../domains/balanceRecordRefModel';
import { BalanceRecordType } from '../../domains/balanceRecord';

const {
  consts: {
    events,
    RULES: {
      INVALID_STATE_TRANSITION,
      MANDATORY_PARAM_IS_MISSING,
      NOT_ENOUGH_BALANCE,
      NOT_SALABLE,
    },
  },
  modelProvider: {
    Chat,
    LiveStream,
    User,
  },
  paymentService,
} = app;

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

class LiveStreamController extends BaseController<
LiveStreamDocument,
Record<string, any>,
LiveStreamResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
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
        schedule: BaseController.createAction({
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
        start: BaseController.createAction({
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
        stop: BaseController.createAction({
          method: 'put',
          path: ':_id/stop',
          priority: -1,
        }),
        purchase: BaseController.createAction({
          method: 'post',
          path: ':_id/purchase',
        }),
        findFavoriteLiveStreamsForUser: BaseController.createAction({
          method: 'get',
          path: ':_id/favorited',
        }),
      },
      plugins: [
        {
          plugin: arrayWithCounterPlugin.restdone,
          options: {
            Model: LiveStream,
            array: 'favoritedUsers',
            path: 'favorites',
            async pre(scope: Scope<LiveStreamDocument>) {
              const { params, user } = scope;
              if (!user) {
                throw new Error('Wrong auth');
              }
              if (params.itemId === 'me') {
                params.itemId = user.id;
              }
              if (params.itemId && user.id !== params.itemId) {
                throw HTTP_STATUSES.FORBIDDEN.createError('You can use only own ID here');
              }
            },
            async afterPut(model: LiveStreamDocument, scope: Scope<LiveStreamDocument>) {
              const { params } = scope;
              const liveStream = await LiveStream.findOne({ _id: model._id }).lean();

              await User.updateOne(
                { _id: liveStream.owner },
                { $addToSet: { favoritedUsers: params.itemId } },
              );
            },
          },
        },
        {
          plugin: arrayWithCounterPlugin.restdone,
          options: {
            Model: LiveStream,
            array: 'likedUsers',
            path: 'liked-users',
            pre(this: BaseController<any, any, any>, scope: Scope<LiveStreamDocument>) {
              const { params } = scope;
              const user = this.getUserStrict(scope);
              if (params.itemId === 'me') {
                params.itemId = user.id;
              }
              if (params.itemId && user.id !== params.itemId) {
                throw HTTP_STATUSES.FORBIDDEN.createError('You can use only own ID here');
              }
            },
          },
        },
        {
          plugin: arrayWithCounterPlugin.restdone,
          options: {
            Model: LiveStream,
            array: 'viewers',
            path: 'viewers',
            allowDelete: false,
            pre(this: BaseController, scope: Scope<LiveStreamDocument>) {
              const { params } = scope;
              const user = this.getUserStrict(scope);
              if (params.itemId === 'me') {
                params.itemId = user.id;
              }
              if (params.itemId && user.id !== params.itemId) {
                throw HTTP_STATUSES.FORBIDDEN.createError('You can use only own ID here');
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
          plugin: incFieldRestdonePlugin.restdone,
          options: {
            model: LiveStream,
            field: 'viewsCounter',
            extraFieldNames: 'owner',
            afterInc(scope: Scope, resource: LiveStreamDomain) {
              return User.incViewsCounter(resource.owner);
            },
          },
        },
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'owner',
          },
        },
      ],
    });
    super(options);
  }

  async pre(scope: Scope<LiveStreamDocument>): Promise<void> {
    const { params, params: { owner } } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isSelect() && !params.owner) {
      params.owner = currentUser.id;
    }
    if (!scope.isSelect() && !currentUser.isAdmin()) {
      if (!owner) {
        params.owner = currentUser.id;
      } else if (owner !== currentUser.id) {
        throw HTTP_STATUSES.FORBIDDEN.createError();
      }
    }
  }

  queryPipe(query: DocumentQuery<any, LiveStreamDocument>, scope: Scope<LiveStreamDocument>) {
    if (scope.isSelect()) {
      if (scope.fieldList.likedUsers) {
        query.slice('likedUsers', -20);
      }
      if (scope.fieldList.favoritedUsers) {
        query.slice('favoritedUsers', -20);
      }
    }
  }

  async schedule(scope: Scope<LiveStreamDocument>) {
    const { body: { scheduledStartingAt } } = scope;
    if (!scheduledStartingAt) {
      throw createAppError(MANDATORY_PARAM_IS_MISSING);
    }
    await this.pre(scope);
    if (moment(scheduledStartingAt).subtract(1, 'hour').isBefore()) {
      throw HTTP_STATUSES.BAD_REQUEST.createError('scheduledStartingAt should be an hour after the current time');
    }
    const liveStream = <LiveStreamDocument>(await this.locateModel(scope));
    this.changeLiveStreamState(liveStream, LiveStreamState.Scheduled);

    liveStream.scheduledStartingAt = scheduledStartingAt;
    liveStream.scheduledAt = new Date();

    await liveStream.save();

    const recipients = await User.getSubscribersOf(liveStream.owner);
    await app.notificationService.createNotification<{ liveStream: string }>({
      notificationType: NotificationType.LiveStreamScheduled,
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
  }

  async start(scope: Scope<LiveStreamDocument>) {
    const { body: { url } } = scope;
    if (!url) {
      throw createAppError(MANDATORY_PARAM_IS_MISSING);
    }
    await this.pre(scope);
    const liveStream = <LiveStreamDocument>(await this.locateModel(scope));
    this.changeLiveStreamState(liveStream, LiveStreamState.OnAir);

    liveStream.url = url;
    liveStream.publicUrl = url;
    liveStream.startedAt = new Date();

    await liveStream.save();

    const recipients = await User.getSubscribersOf(liveStream.owner);
    await app.notificationService.createNotification<{ liveStream: string }>({
      notificationType: NotificationType.LiveStreamStarted,
      body: 'LiveStream started',
      metadata: {
        liveStream: liveStream._id,
        // @ts-ignore
        owner: liveStream.owner.toJSON(),
      },
      recipients,
    });

    return liveStream;
  }

  async stop(scope: Scope<LiveStreamDocument>) {
    await this.pre(scope);
    const liveStream = <LiveStreamDocument>(await this.locateModel(scope));
    this.changeLiveStreamState(liveStream, LiveStreamState.Completed);

    liveStream.stoppedAt = new Date();

    await liveStream.save();

    app.moleculerBroker.emit(events.liveStreams.completed, <LiveStreamCompleted>{
      _id: liveStream.id,
    });

    return liveStream;
  }

  async purchase(scope: Scope<LiveStreamDocument>) {
    const user = this.getUserStrict(scope);
    const liveStream = await LiveStream.findById(scope.params._id).lean();
    if (!liveStream) {
      throw HTTP_STATUSES.NOT_FOUND.createError();
    }
    const { _id: contentId, price } = liveStream;
    if (!price) {
      throw createAppError(NOT_SALABLE);
    }
    const result = await paymentService.processRecord({
      owner: user._id,
      type: BalanceRecordType.PurchaseContent,
      ref: contentId,
      refModel: BalanceRecordRefModel.LiveStream,
      sum: -1 * price,
    });
    if (!result) {
      throw createAppError(NOT_ENOUGH_BALANCE);
    }
    return { sum: price };
  }

  async findFavoriteLiveStreamsForUser(scope: Scope<LiveStreamDocument>) {
    const { params, user: currentUser } = scope;
    if (!currentUser) {
      throw new Error('No user');
    }

    const userId = params._id === 'me' ? currentUser.id : params._id;
    const livestreams = await LiveStream.findFavoriteLiveStreamsForUser(userId);
    return livestreams;
  }

  assignFilter(
    queryParams: Record<string, any>,
    fieldName: string,
    scope: Scope<LiveStreamDocument>,
  ) {
    const { user } = scope;
    // do not allow not-admins update owner
    if (fieldName === 'owner' && scope.isUpdate() && !user?.isAdmin()) {
      return false;
    }
    return super.assignFilter(queryParams, fieldName, scope);
  }

  async beforeSave(scope: Scope<LiveStreamDocument>): Promise<void> {
    const { body: { url }, model } = scope;
    if (scope.isInsert()) {
      // TODO: Integrate with video processing
      model.duration = -1;
      await Chat.createLiveStream(model._id, model.owner);
    }
    if (scope.model.isModified('url')) {
      model.publicUrl = url;
    }
  }

  async post(resource: LiveStreamResource, scope: Scope<LiveStreamDocument>) {
    return <LiveStreamResource>(scope.isSelectOne()
      ? this.applySubscriptionRules([resource], scope.user!)[0]
      : resource);
  }

  async collectionPost(list: LiveStreamResource[], scope: Scope<LiveStreamDocument>) {
    return this.applySubscriptionRules(list, scope.user!);
  }

  private applySubscriptionRules(
    list: LiveStreamResource[],
    user: UserDocument,
  ): LiveStreamResource[] {
    return list.map((item) => (
      user.isSubscribedTo(item.owner._id)
        || user.hasPurchasedContent(BalanceRecordRefModel.LiveStream, item._id)
        ? item
        : <LiveStreamResource>_.omit(item, ...SUBSCRIBED_ONLY_FIELDS)
    ));
  }

  private changeLiveStreamState(liveStream: LiveStreamDocument, newState: LiveStreamState) {
    if (!liveStream.changeState(newState)) {
      throw createAppError(INVALID_STATE_TRANSITION, { currentState: liveStream.state, newState });
    }
  }
}

export default LiveStreamController;
