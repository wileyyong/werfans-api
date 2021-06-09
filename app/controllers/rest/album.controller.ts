import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import { DocumentQuery } from 'mongoose';
import BaseController from 'app/lib/base.restdone.controller';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import { AlbumDocument, AlbumDomain, AlbumResource } from '../../domains/album';
import { NotificationType } from '../../domains/notification';
import { Scope } from '../../domains/app';
import incFieldRestdonePlugin from '../../lib/restdone.plugin/inc-field.restdone.plugin';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';
import createAppError from '../../lib/createAppError';
import { BalanceRecordType } from '../../domains/balanceRecord';
import { BalanceRecordRefModel } from '../../domains/balanceRecordRefModel';

const {
  consts: {
    RULES: {
      NOT_ENOUGH_BALANCE,
      NOT_SALABLE,
    },
  },
  modelProvider: { Album, User },
  paymentService,
} = app;

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

class AlbumController extends BaseController<
AlbumDocument,
Record<string, any>,
AlbumResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        purchase: BaseController.createAction({
          method: 'post',
          path: ':_id/purchase',
        }),
        findFavoriteAlbumsForUser: BaseController.createAction({
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
          plugin: incFieldRestdonePlugin.restdone,
          options: {
            model: Album,
            field: 'viewsCounter',
            extraFieldNames: 'owner',
            afterInc(scope: Scope, resource: AlbumDomain) {
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
          plugin: banContentPlugin.restdone,
          options: {
            Model: Album,
          },
        },
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'owner',
          },
        },
        {
          plugin: arrayWithCounterPlugin.restdone,
          options: {
            Model: Album,
            array: 'favoritedUsers',
            path: 'favorites',
            async pre(scope: Scope<AlbumDocument>) {
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
            async afterPut(model: AlbumDocument, scope: Scope<AlbumDocument>) {
              const { params } = scope;
              const album = await Album.findOne({ _id: model._id }).lean();

              await User.updateOne(
                { _id: album.owner },
                { $addToSet: { favoritedUsers: params.itemId } },
              );
            },
          },
        },
      ],
    });
    super(options);
  }

  async purchase(scope: Scope<AlbumDocument>) {
    const user = this.getUserStrict(scope);
    const album = await Album.findById(scope.params._id).lean();
    if (!album) {
      throw HTTP_STATUSES.NOT_FOUND.createError();
    }
    const { _id: contentId, price } = album;
    if (!price) {
      throw createAppError(NOT_SALABLE);
    }
    const result = await paymentService.processRecord({
      owner: user._id,
      type: BalanceRecordType.PurchaseContent,
      ref: contentId,
      refModel: BalanceRecordRefModel.Album,
      sum: -1 * price,
    });
    if (!result) {
      throw createAppError(NOT_ENOUGH_BALANCE);
    }
    return { sum: price };
  }

  async pre(scope: Scope<AlbumDocument>): Promise<void> {
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
      } else if (owner !== currentUser.id) {
        throw HTTP_STATUSES.FORBIDDEN.createError();
      }
    }
    if (!scope.isAdminMode) {
      params.$or = [{ suspendedAt: { $exists: false } }, { owner: currentUser._id }];
    }
  }

  async afterSave(scope: Scope<AlbumDocument>) {
    if (scope.isInsert()) {
      const { model: album } = scope;
      const recipients = await User.getSubscribersOf(album.owner);

      await app.notificationService.createNotification<{ album: string }>({
        notificationType: NotificationType.AlbumCreated,
        body: 'Album added',
        metadata: {
          album: album._id,
          // @ts-ignore
          owner: album.owner.toJSON(),
        },
        recipients,
      });
    }
  }

  queryPipe(query: DocumentQuery<any, AlbumDocument>, scope: Scope<AlbumDocument>) {
    if (scope.isSelect()) {
      if (scope.fieldList.favoritedUsers) {
        query.slice('favoritedUsers', -20);
      }
    }
  }

  async findFavoriteAlbumsForUser(scope: Scope<AlbumDocument>) {
    const { params, user: currentUser } = scope;
    if (!currentUser) {
      throw new Error('No user');
    }

    const userId = params._id === 'me' ? currentUser.id : params._id;
    const albums = await Album.findFavoriteAlbumsForUser(userId);
    return albums;
  }

  assignFilter(
    queryParams: Record<string, any>,
    fieldName: string,
    scope: Scope<AlbumDocument>,
  ) {
    // do not allow not-admins update owner
    if (fieldName === 'owner' && scope.isUpdate() && !scope.isAdminMode) {
      return false;
    }
    return super.assignFilter(queryParams, fieldName, scope);
  }
}

exports = AlbumController;
module.exports = AlbumController;
