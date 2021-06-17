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
const banContent_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/banContent.restdone.plugin"));
const array_with_counter_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/array-with-counter.restdone.plugin"));
const notification_1 = require("../../domains/notification");
const inc_field_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/inc-field.restdone.plugin"));
const balanceRecordRefModel_1 = require("../../domains/balanceRecordRefModel");
const { modelProvider: { Album, Photo, User }, } = app_1.default;
const SUBSCRIBED_ONLY_FIELDS = ['url'];
/**
 * @swagger
 *
 * /photos:
 *   post:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Photos
 *     summary: Creates photo without album
 *     operationId: createPhotoWithoutAlbum
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/PhotoModel'
 *     responses:
 *       '200':
 *         description: returns created photo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/PhotoModelResponse'
 * /photos/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Photos
 *     summary: Returns photo by _id
 *     operationId: getPhotos
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns photo by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/PhotoModelResponse'
 * /albums/{albumId}/photos:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Photos
 *     summary: Returns array of photos of the specified album
 *     operationId: getUserPhotos
 *     parameters:
 *       - in: path
 *         name: albumId
 *         description: album _id
 *         required: true
 *         schema:
 *           type: string
 *           description: album _id
 *     responses:
 *       '200':
 *         description: returns album's photos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhotoModelResponse'
 *   post:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Photos
 *     summary: Creates a photo in certain album
 *     operationId: createPhoto
 *     parameters:
 *       - in: path
 *         name: album
 *         description: album _id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/PhotoModel'
 *     responses:
 *       '200':
 *         description: returns created photo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/PhotoModelResponse'
 * /albums/{albumId}/photos/{photoId}:
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Photos
 *     summary: Updates photo by _id
 *     operationId: updatePhoto
 *     parameters:
 *       - in: path
 *         name: albumId
 *         description: album _id
 *         required: true
 *         schema:
 *           type: string
 *           description: album _id
 *       - in: path
 *         name: photoId
 *         description: photo _id
 *         required: true
 *         schema:
 *           type: string
 *           description: photo _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/PhotoModel'
 *     responses:
 *       '200':
 *         description: returns updated photo
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/PhotoModelResponse'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Photos
 *     summary: Removes photo by _id. Photo must be owned by user or admin
 *     operationId: deleteUserPhoto
 *     parameters:
 *       - in: path
 *         name: album
 *         description: album _id
 *         required: true
 *         schema:
 *           type: string
 *           description: album _id
 *       - in: path
 *         name: photoId
 *         description: photo _id
 *         required: true
 *         schema:
 *           type: string
 *           description: photo _id
 *     responses:
 *       '204':
 *         description: Empty response
 * /photos/{userId}/favorited:
 *   get:
 *     tags:
 *       - Photos
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get user's favorite photos
 *     operationId: findFavoritePhotosForUser
 *     parameters:
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: return a list of photos objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/PhotoModelResponse'
 * /photos/{photoId}/favorites:
 *   get:
 *     tags:
 *       - Photos
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get users who added photo to favorites
 *     operationId: GetPhotoUsersInFavorites
 *     parameters:
 *       - name: photoId
 *         description: photo _id
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
 * /photos/{photoId}/favorites/{userId}:
 *   put:
 *     tags:
 *       - Photos
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: put to favorites
 *     operationId: AddPhotoToFavorites
 *     parameters:
 *       - name: photoId
 *         description: photo _id
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
 *         description: return a list of users who added photo to favorites
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
 *       - Photos
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: delete from favorites
 *     operationId: DeletePhotoFromFavorites
 *     parameters:
 *       - name: photoId
 *         description: photo _id
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
 */
class PhotoController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: Photo,
                },
            },
            path: ['/photos', '/albums/:album/photos'],
            expandForAdmin: true,
            fields: [
                'name',
                'description',
                'isCover',
                'watermarkUrl',
                'watermarkOpacity',
                'blurIntensity',
                'url',
                'publicUrl',
                {
                    name: 'owner',
                    fields: ['username'],
                },
                {
                    name: 'album',
                    fields: ['name'],
                },
                {
                    name: 'favoritedUsers',
                    fields: [
                        'username',
                        'type',
                        'avatarUrl',
                    ],
                },
                'favoritedUsersCounter',
                'viewsCounter',
                'suspendedAt',
                'banningReasonType',
                'banningReasonDescription',
                'createdAt',
                'updatedAt',
            ],
            readOnlyFields: [
                'publicUrl',
                'viewsCounter',
                'suspendedAt',
                'banningReasonType',
                'banningReasonDescription',
                'favoritedUsers',
                'favoritedUsersCounter',
                'createdAt',
                'updatedAt',
            ],
            actions: {
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
                findFavoritePhotosForUser: {
                    method: 'get',
                    path: ':_id/favorited',
                },
            },
            plugins: [
                /**
                 * @swagger
                 * /photos/{photoId}/:
                 *   post:
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     tags:
                 *       - Photos
                 *     summary: Increments views counter for a photo
                 *     operationId: increasePhotoViewsCounter
                 *     parameters:
                 *       - in: path
                 *         name: photoId
                 *         description: photo _id
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: photo _id
                 *     responses:
                 *       '204':
                 *         description: Empty response
                 */
                {
                    plugin: inc_field_restdone_plugin_1.default.restdone,
                    options: {
                        model: Photo,
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
                 * /admin/photos/{id}/ban:
                 *   post:
                 *     tags:
                 *       - Photos
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     summary: ban photo by id
                 *     operationId: photosBan
                 *     parameters:
                 *       - name: id
                 *         in: path
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: photo id.
                 *     responses:
                 *       '204':
                 *         description: Empty response
                 *
                 * /admin/photos/{id}/unban:
                 *   post:
                 *     tags:
                 *       - Photos
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     summary: unban photo by id
                 *     operationId: photosUnban
                 *     parameters:
                 *       - name: id
                 *         in: path
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: photo id.
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
                 */
                {
                    plugin: banContent_restdone_plugin_1.default.restdone,
                    options: {
                        Model: Photo,
                    },
                },
                {
                    plugin: array_with_counter_restdone_plugin_1.default.restdone,
                    options: {
                        Model: Photo,
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
                                const photo = yield Photo.findOne({ _id: model._id }).lean();
                                if (photo)
                                    yield User.updateOne({ _id: photo.owner }, { $addToSet: { favoritedUsers: params.itemId } });
                            });
                        },
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, params: { album: albumId } } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isSelect() && !scope.isAdminMode) {
                params.owner = currentUser.id;
            }
            if (!scope.isSelect() && !scope.isAdminMode) {
                const album = yield Album.findOne({ _id: albumId, owner: params.owner }).lean();
                if (!album) {
                    throw http_status_node_1.default.FORBIDDEN.createError();
                }
            }
            if (!scope.isAdminMode) {
                params.$or = [{ suspendedAt: { $exists: false } }, { owner: currentUser._id }];
            }
        });
    }
    queryPipe(query, scope) {
        if (scope.isSelect()) {
            if (scope.fieldList.favoritedUsers) {
                query.slice('favoritedUsers', -20);
            }
        }
    }
    findFavoritePhotosForUser(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, user: currentUser } = scope;
            if (!currentUser) {
                throw new Error('No user');
            }
            const userId = params._id === 'me' ? currentUser.id : params._id;
            const photos = yield Photo.findFavoritePhotosForUser(userId);
            return photos;
        });
    }
    assignFilter(queryParams, fieldName, scope) {
        // do not allow not-admins update owner and album
        if ((fieldName === 'owner' || fieldName === 'album') && scope.isUpdate() && !scope.isAdminMode) {
            return false;
        }
        return super.assignFilter(queryParams, fieldName, scope);
    }
    beforeSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope.model.isModified('url')) {
                const { body: { url }, model } = scope;
                // TODO: Integrate with photo processing
                model.publicUrl = url;
            }
        });
    }
    afterSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope.isInsert()) {
                const { model: photo } = scope;
                const recipients = yield User.getSubscribersOf(photo.owner);
                yield Album.incPhotoCounter(photo.album, 1);
                yield app_1.default.notificationService.createNotification({
                    notificationType: notification_1.NotificationType.PhotoAdded,
                    body: 'Photo added',
                    metadata: {
                        photo: photo._id,
                        album: photo.album,
                        // @ts-ignore
                        owner: photo.owner.toJSON(),
                    },
                    recipients,
                });
            }
        });
    }
    beforeDelete(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { model: photo } = scope;
            yield Album.incPhotoCounter(photo.album, -1);
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
        return list.map((item) => {
            var _a;
            return (user.isSubscribedTo(item.owner._id)
                || user.hasPurchasedContent(balanceRecordRefModel_1.BalanceRecordRefModel.Album, (_a = item.album) === null || _a === void 0 ? void 0 : _a._id)
                ? item
                : lodash_1.default.omit(item, ...SUBSCRIBED_ONLY_FIELDS));
        });
    }
}
exports = PhotoController;
module.exports = PhotoController;
//# sourceMappingURL=photo.controller.js.map