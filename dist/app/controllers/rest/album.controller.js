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
const app_1 = __importDefault(require("app"));
const http_status_node_1 = __importDefault(require("http-status-node"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const banContent_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/banContent.restdone.plugin"));
const array_with_counter_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/array-with-counter.restdone.plugin"));
const notification_1 = require("../../domains/notification");
const inc_field_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/inc-field.restdone.plugin"));
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const createAppError_1 = __importDefault(require("../../lib/createAppError"));
const balanceRecord_1 = require("../../domains/balanceRecord");
const balanceRecordRefModel_1 = require("../../domains/balanceRecordRefModel");
const { consts: { RULES: { NOT_ENOUGH_BALANCE, NOT_SALABLE, }, }, modelProvider: { Album, User }, paymentService, } = app_1.default;
/**
 * @swagger
 *
 * components:
 *   descriptions:
 *    AlbumsAdditionalPathsOne: >
 *      Additional paths:
 *
 *        * /users/{userId}/albums/{_id},
 *
 *        * /admin/albums/{_id},
 *
 *        * /admin/users/{userId}/albums/{_id}
 *
 *    AlbumsAdditionalPathsList: >
 *      Additional paths:
 *
 *        * /users/{userId}/albums,
 *
 *        * /admin/albums,
 *
 *        * /admin/users/{userId}/albums
 *
 * /albums:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Albums
 *     summary: Returns array of albums of the specified user.
 *     description:
 *       $ref: "#/components/descriptions/AlbumsAdditionalPathsList"
 *     operationId: albumsGetList
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id to filter the list by owner, you can use 'me' placeholder
 *         required: false
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: returns albums
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AlbumModelResponseList'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Albums
 *     summary: Creates an album
 *     description:
 *       $ref: "#/components/descriptions/AlbumsAdditionalPathsList"
 *     operationId: albumsCreate
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id to create an album for, you can use 'me' placeholder
 *         required: false
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/AlbumModel'
 *     responses:
 *       '201':
 *         description: returns created album
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/AlbumModelResponseCreated'
 * /albums/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Albums
 *     summary: Returns album by _id.
 *     description:
 *       $ref: "#/components/descriptions/AlbumsAdditionalPathsOne"
 *     operationId: albumsGetOne
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: album _id
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: userId
 *         description: owner user ID to filter by, you can use 'me' placeholder.
 *         schema:
 *           type: string
 *         required: false
 *     responses:
 *       '200':
 *         description: returns album by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/AlbumModelResponseList'
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Albums
 *     summary: Updates album by _id
 *     description:
 *       $ref: "#/components/descriptions/AlbumsAdditionalPathsOne"
 *     operationId: albumsUpdate
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, you can use 'me' placeholder
 *         required: false
 *         schema:
 *           type: string
 *       - in: path
 *         name: _id
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
 *             $ref: '#/components/schemas/AlbumModel'
 *     responses:
 *       '200':
 *         description: returns updated album
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/AlbumModelResponseList'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Albums
 *     summary: Removes album by _id. Album must be owned by user it he's not an admin.
 *     description:
 *       $ref: "#/components/descriptions/AlbumsAdditionalPathsOne"
 *     operationId: albumsUpdateDelete
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, you can use 'me' placeholder
 *         required: false
 *         schema:
 *           type: string
 *       - in: path
 *         name: _id
 *         description: album _id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Empty response
 * /albums/{_id}/purchase:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Albums
 *     summary: Purchases an album
 *     description:
 *       $ref: "#/components/descriptions/AlbumsAdditionalPathsList"
 *     operationId: albumsPurchase
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: album id
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
 * /albums/{userId}/favorited:
 *   get:
 *     tags:
 *       - Albums
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get user's favorite albums
 *     operationId: findFavoriteAlbumsForUser
 *     parameters:
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: return a list of albums objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/AlbumModelResponseList'
 * /albums/{albumId}/favorites:
 *   get:
 *     tags:
 *       - Albums
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get users who added album to favorites
 *     operationId: GetAlbumUsersInFavorites
 *     parameters:
 *       - name: albumId
 *         description: album _id
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
 * /albums/{albumId}/favorites/{userId}:
 *   put:
 *     tags:
 *       - Albums
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: put to favorites
 *     operationId: AddAlbumToFavorites
 *     parameters:
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: albumId
 *         description: album _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: return a list of users who added album to favorites
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
 *       - Albums
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: delete from favorites
 *     operationId: DeleteAlbumFromFavorites
 *     parameters:
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: albumId
 *         description: album _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '204':
 *         description: Empty response
 */
class AlbumController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: Album,
                },
            },
            path: ['/albums', '/users/:owner/albums'],
            expandForAdmin: true,
            fields: [
                'name',
                'coverUrl',
                'price',
                'photosCounter',
                'viewsCounter',
                {
                    name: 'owner',
                    fields: ['username'],
                },
                'suspendedAt',
                'banningReasonType',
                'banningReasonDescription',
                {
                    name: 'favoritedUsers',
                    fields: [
                        'username',
                        'type',
                        'avatarUrl',
                    ],
                },
                'favoritedUsersCounter',
                'createdAt',
                'updatedAt',
            ],
            readOnlyFields: [
                'photosCounter',
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
                purchase: base_restdone_controller_1.default.createAction({
                    method: 'post',
                    path: ':_id/purchase',
                }),
                findFavoriteAlbumsForUser: base_restdone_controller_1.default.createAction({
                    method: 'get',
                    path: ':_id/favorited',
                }),
            },
            plugins: [
                /**
                 * @swagger
                 * /albums/{albumId}/inc/viewsCounter:
                 *   post:
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     tags:
                 *       - Albums
                 *     summary: Increments views counter for a photo
                 *     operationId: increaseAlbumViewsCounter
                 *     parameters:
                 *       - in: path
                 *         name: albumId
                 *         description: album _id
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: album _id
                 *     responses:
                 *       '204':
                 *         description: Empty response
                 */
                {
                    plugin: inc_field_restdone_plugin_1.default.restdone,
                    options: {
                        model: Album,
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
                 * /admin/albums/{id}/ban:
                 *   post:
                 *     tags:
                 *       - Albums
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     summary: ban album by id
                 *     operationId: albumsBan
                 *     parameters:
                 *       - name: id
                 *         in: path
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: album id.
                 *     responses:
                 *       '204':
                 *         description: Empty response
                 *
                 * /admin/albums/{id}/unban:
                 *   post:
                 *     tags:
                 *       - Albums
                 *     security:
                 *       - Bearer Token: []
                 *       - OauthSecurity: []
                 *     summary: unban album by id
                 *     operationId: albumsUnban
                 *     parameters:
                 *       - name: id
                 *         in: path
                 *         required: true
                 *         schema:
                 *           type: string
                 *           description: album id.
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
                        Model: Album,
                    },
                },
                {
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                    options: {
                        field: 'owner',
                    },
                },
                {
                    plugin: array_with_counter_restdone_plugin_1.default.restdone,
                    options: {
                        Model: Album,
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
                                const album = yield Album.findOne({ _id: model._id }).lean();
                                if (album) {
                                    yield User.updateOne({ _id: album.owner }, { $addToSet: { favoritedUsers: params.itemId } });
                                }
                            });
                        },
                    },
                },
            ],
        });
        super(options);
    }
    purchase(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.getUserStrict(scope);
            const album = yield Album.findById(scope.params._id).lean();
            if (!album) {
                throw http_status_node_1.default.NOT_FOUND.createError();
            }
            const { _id: contentId, price } = album;
            if (!price) {
                throw createAppError_1.default(NOT_SALABLE);
            }
            const result = yield paymentService.processRecord({
                owner: user._id,
                type: balanceRecord_1.BalanceRecordType.PurchaseContent,
                ref: contentId,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Album,
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
            const { params, params: { owner }, user: currentUser } = scope;
            if (!currentUser) {
                throw new Error('No user');
            }
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
    afterSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope.isInsert()) {
                const { model: album } = scope;
                const recipients = yield User.getSubscribersOf(album.owner);
                yield app_1.default.notificationService.createNotification({
                    notificationType: notification_1.NotificationType.AlbumCreated,
                    body: 'Album added',
                    metadata: {
                        album: album._id,
                        // @ts-ignore
                        owner: album.owner.toJSON(),
                    },
                    recipients,
                });
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
    findFavoriteAlbumsForUser(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, user: currentUser } = scope;
            if (!currentUser) {
                throw new Error('No user');
            }
            const userId = params._id === 'me' ? currentUser.id : params._id;
            const albums = yield Album.findFavoriteAlbumsForUser(userId);
            return albums;
        });
    }
    assignFilter(queryParams, fieldName, scope) {
        // do not allow not-admins update owner
        if (fieldName === 'owner' && scope.isUpdate() && !scope.isAdminMode) {
            return false;
        }
        return super.assignFilter(queryParams, fieldName, scope);
    }
}
exports = AlbumController;
module.exports = AlbumController;
//# sourceMappingURL=album.controller.js.map