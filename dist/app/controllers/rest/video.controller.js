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
const app_1 = __importDefault(require("app"));
const http_status_node_1 = __importDefault(require("http-status-node"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const inc_field_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/inc-field.restdone.plugin"));
const banContent_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/banContent.restdone.plugin"));
const notification_1 = require("../../domains/notification");
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const balanceRecordRefModel_1 = require("../../domains/balanceRecordRefModel");
const createAppError_1 = __importDefault(require("../../lib/createAppError"));
const balanceRecord_1 = require("../../domains/balanceRecord");
const { consts: { RULES: { NOT_ENOUGH_BALANCE, NOT_SALABLE, }, }, modelProvider: { User, Video }, paymentService, } = app_1.default;
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
class VideoController extends base_restdone_controller_1.default {
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
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
                purchase: base_restdone_controller_1.default.createAction({
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
                    plugin: inc_field_restdone_plugin_1.default.restdone,
                    options: {
                        model: Video,
                        field: 'viewsCounter',
                        extraFieldNames: 'owner',
                        afterInc(scope, resource) {
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
                    plugin: banContent_restdone_plugin_1.default.restdone,
                    options: {
                        Model: Video,
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
    purchase(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.getUserStrict(scope);
            const video = yield Video.findById(scope.params._id).lean();
            if (!video) {
                throw http_status_node_1.default.NOT_FOUND.createError();
            }
            const { _id: contentId, price } = video;
            if (!price) {
                throw createAppError_1.default(NOT_SALABLE);
            }
            const result = yield paymentService.processRecord({
                owner: user._id,
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                ref: contentId,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Video,
                sum: -1 * price,
            });
            if (!result) {
                throw createAppError_1.default(NOT_ENOUGH_BALANCE);
            }
            return { sum: price };
        });
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, params: { owner } } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isSelect() && !params.owner) {
                params.owner = currentUser.id;
            }
            if (!scope.isSelect() && !scope.isAdminMode) {
                if (!owner) {
                    params.owner = currentUser.id;
                }
                else if (owner !== currentUser.id) {
                    throw http_status_node_1.default.FORBIDDEN.createError();
                }
            }
            if (!scope.isAdminMode) {
                params.$or = [{ suspendedAt: { $exists: false } }, { owner: currentUser._id }];
            }
        });
    }
    assignFilter(queryParams, fieldName, scope) {
        // do not allow not-admins update owner
        if (fieldName === 'owner' && scope.isUpdate() && !scope.isAdminMode) {
            return false;
        }
        return super.assignFilter(queryParams, fieldName, scope);
    }
    beforeSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope.model.isModified('url')) {
                const { body: { url }, model } = scope;
                // TODO: Integrate with photo processing
                if (!model.coverUrl) {
                    model.coverUrl = yield app_1.default.ffmpegService.extractCover(url, model.owner);
                }
                model.publicUrl = url;
            }
        });
    }
    afterSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope.isInsert()) {
                const video = scope.model;
                const recipients = yield User.getSubscribersOf(video.owner);
                yield app_1.default.notificationService.createNotification({
                    notificationType: notification_1.NotificationType.VideoUploaded,
                    body: 'Video uploaded',
                    metadata: {
                        video: video.id,
                        // @ts-ignore
                        owner: video.owner.toJSON(),
                    },
                    recipients,
                });
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
            || user.hasPurchasedContent(balanceRecordRefModel_1.BalanceRecordRefModel.Video, item._id)
            ? item
            : lodash_1.default.omit(item, ...SUBSCRIBED_ONLY_FIELDS)));
    }
}
exports = VideoController;
module.exports = VideoController;
//# sourceMappingURL=video.controller.js.map