import _ from 'lodash';
import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import incFieldRestdonePlugin from 'app/lib/restdone.plugin/inc-field.restdone.plugin';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import { NotificationType } from '../../domains/notification';
import { VideoDocument, VideoDomain, VideoResource } from '../../domains/video';
import { Scope } from '../../domains/app';
import { UserDocument } from '../../domains/user';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';
import { BalanceRecordRefModel } from '../../domains/balanceRecordRefModel';
import createAppError from '../../lib/createAppError';
import { BalanceRecordType } from '../../domains/balanceRecord';

const {
  consts: {
    RULES: {
      NOT_ENOUGH_BALANCE,
      NOT_SALABLE,
    },
  },
  modelProvider: { User, Video },
  paymentService,
} = app;

const SUBSCRIBED_ONLY_FIELDS = ['url'];

/**
 * @swagger
 *
 * /videos/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Videos
 *     summary: Returns video by _id
 *     operationId: getVideo
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns video by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/VideoModelResponseList'
 * /users/{user}/videos:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Videos
 *     summary: Returns array of videos of the specified user
 *     operationId: getUserVideos
 *     parameters:
 *       - in: path
 *         name: user
 *         description: user id, you can use "me" shortcut
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut
 *     responses:
 *       '200':
 *         description: returns user's videos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/VideoModelResponseList'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Videos
 *     summary: Creates a video
 *     operationId: createVideo
 *     parameters:
 *       - in: path
 *         name: user
 *         description: user id, you can use "me" shortcut
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/VideoModel'
 *     responses:
 *       '200':
 *         description: returns created video
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/VideoModelResponseCreated'
 * /users/{user}/videos/{videoId}:
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Videos
 *     summary: Updates video by _id
 *     operationId: updateVideo
 *     parameters:
 *       - in: path
 *         name: user
 *         description: user _id, 'me' placeholder can be used
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id, 'me' placeholder can be used
 *       - in: path
 *         name: videoId
 *         description: video _id
 *         required: true
 *         schema:
 *           type: string
 *           description: video _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/VideoModel'
 *     responses:
 *       '200':
 *         description: returns updated video
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/VideoModelResponseList'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Videos
 *     summary: Removes video by _id. Video must be owned by user or admin
 *     operationId: deleteUserVideo
 *     parameters:
 *       - in: path
 *         name: user
 *         description: user _id, 'me' placeholder can be used
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id, 'me' placeholder can be used
 *       - in: path
 *         name: videoId
 *         description: video _id
 *         required: true
 *         schema:
 *           type: string
 *           description: video _id
 *     responses:
 *       '204':
 *         description: Empty response
 *
 * /videos/{_id}/purchase:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Videos
 *     summary: Purchases a video
 *     operationId: videosPurchase
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: video id
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

class VideoController extends BaseController<VideoDocument, Record<string, any>, VideoResource> {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: Video,
        },
      },
      path: ['/videos', '/users/:owner/videos'],
      expandForAdmin: true,
      fields: [
        'name',
        'description',
        'price',
        'duration',
        'watermarkUrl',
        'watermarkOpacity',
        'coverUrl',
        'url',
        'publicUrl',
        'viewsCounter',
        'commentsCounter',
        {
          name: 'owner',
          fields: ['username'],
        },
        'suspendedAt',
        'banningReasonType',
        'banningReasonDescription',
        'createdAt',
        'updatedAt',
      ],
      readOnlyFields: [
        'viewsCounter',
        'commentsCounter',
        'publicUrl',
        'suspendedAt',
        'banningReasonType',
        'banningReasonDescription',
        'createdAt',
        'updatedAt',
      ],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        purchase: BaseController.createAction({
          method: 'post',
          path: ':_id/purchase',
        }),
      },
      plugins: [
        /**
         * @swagger
         * /videos/{videoId}/inc/viewsCounter:
         *   post:
         *     security:
         *       - Bearer Token: []
         *       - OauthSecurity: []
         *     tags:
         *       - Videos
         *     summary: Increments views counter for a video
         *     operationId: increaseVideoViewsCounter
         *     parameters:
         *       - in: path
         *         name: videoId
         *         description: video _id
         *         required: true
         *         schema:
         *           type: string
         *           description: video _id
         *     responses:
         *       '204':
         *         description: Empty response
         */
        {
          plugin: incFieldRestdonePlugin.restdone,
          options: {
            model: Video,
            field: 'viewsCounter',
            extraFieldNames: 'owner',
            afterInc(scope: Scope, resource: VideoDomain) {
              return User.incViewsCounter(resource.owner);
            },
          },
        },
        /**
         * @swagger
         *
         * /admin/videos/{id}/ban:
         *   post:
         *     tags:
         *       - Videos
         *     security:
         *       - Bearer Token: []
         *       - OauthSecurity: []
         *     summary: ban video by id
         *     operationId: videosBan
         *     parameters:
         *       - name: id
         *         in: path
         *         required: true
         *         schema:
         *           type: string
         *           description: video id.
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               banningReasonType:
         *                 type: string
         *                 enum:
         *                   - abuse
         *                   - nudity
         *                   - spam
         *               banningReasonDescription:
         *                 type: string
         *     responses:
         *       '204':
         *         description: Empty response
         *
         * /admin/videos/{id}/unban:
         *   post:
         *     tags:
         *       - Videos
         *     security:
         *       - Bearer Token: []
         *       - OauthSecurity: []
         *     summary: unban video by id
         *     operationId: videosUnban
         *     parameters:
         *       - name: id
         *         in: path
         *         required: true
         *         schema:
         *           type: string
         *           description: video id.
         *     responses:
         *       '204':
         *         description: Empty response
         */
        {
          plugin: banContentPlugin.restdone,
          options: {
            Model: Video,
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

  async purchase(scope: Scope<VideoDocument>) {
    const user = this.getUserStrict(scope);
    const video = await Video.findById(scope.params._id).lean();
    if (!video) {
      throw HTTP_STATUSES.NOT_FOUND.createError();
    }
    const { _id: contentId, price } = video;
    if (!price) {
      throw createAppError(NOT_SALABLE);
    }
    const result = await paymentService.processRecord({
      owner: user._id,
      type: BalanceRecordType.PurchaseContent,
      ref: contentId,
      refModel: BalanceRecordRefModel.Video,
      sum: -1 * price,
    });
    if (!result) {
      throw createAppError(NOT_ENOUGH_BALANCE);
    }
    return { sum: price };
  }

  async pre(scope: Scope<VideoDocument>): Promise<void> {
    const { params, params: { owner } } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isSelect() && !params.owner) {
      params.owner = currentUser.id;
    }
    if (!scope.isSelect() && !scope.isAdminMode) {
      if (!owner) {
        params.owner = currentUser.id;
      } else if (owner !== currentUser.id) {
        throw HTTP_STATUSES.FORBIDDEN.createError();
      }
    }
    if (!scope.isAdminMode) {
      params.$or = [{ suspendedAt: { $exists: false } }, { owner: currentUser._id }];
    }
  }

  assignFilter(
    queryParams: Record<string, any>,
    fieldName: string,
    scope: Scope<VideoDocument>,
  ) {
    // do not allow not-admins update owner
    if (fieldName === 'owner' && scope.isUpdate() && !scope.isAdminMode) {
      return false;
    }
    return super.assignFilter(queryParams, fieldName, scope);
  }

  async beforeSave(scope: Scope<VideoDocument>): Promise<void> {
    if (scope.model.isModified('url')) {
      const { body: { url }, model } = scope;
      // TODO: Integrate with photo processing
      if (!model.coverUrl) {
        model.coverUrl = await app.ffmpegService.extractCover(url, model.owner);
      }
      model.publicUrl = url;
    }
  }

  async afterSave(scope: Scope<VideoDocument>): Promise<void> {
    if (scope.isInsert()) {
      const video = scope.model;
      const recipients = await User.getSubscribersOf(video.owner);
      await app.notificationService.createNotification<{ video: string }>({
        notificationType: NotificationType.VideoUploaded,
        body: 'Video uploaded',
        metadata: {
          video: video.id,
          // @ts-ignore
          owner: video.owner.toJSON(),
        },
        recipients,
      });
    }
  }

  async post(resource: VideoResource, scope: Scope<VideoDocument>) {
    return <VideoResource>(scope.isSelectOne()
      ? this.applySubscriptionRules([resource], scope.user!)[0]
      : resource);
  }

  async collectionPost(list: VideoResource[], scope: Scope<VideoDocument>) {
    return this.applySubscriptionRules(list, scope.user!);
  }

  applySubscriptionRules(list: VideoResource[], user: UserDocument) {
    return list.map((item) => (
      user.isSubscribedTo(item.owner._id)
        || user.hasPurchasedContent(BalanceRecordRefModel.Video, item._id)
        ? item
        : <VideoResource>_.omit(item, ...SUBSCRIBED_ONLY_FIELDS)
    ));
  }
}

exports = VideoController;
module.exports = VideoController;
