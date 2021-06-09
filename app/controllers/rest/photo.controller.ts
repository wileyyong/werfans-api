import _ from 'lodash';
import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import { DocumentQuery } from 'mongoose';
import BaseController from 'app/lib/base.restdone.controller';
import banContentPlugin from 'app/lib/restdone.plugin/banContent.restdone.plugin';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import { PhotoDocument, PhotoDomain, PhotoResource } from '../../domains/photo';
import { NotificationType } from '../../domains/notification';
import { Scope } from '../../domains/app';
import { UserDocument } from '../../domains/user';
import incFieldRestdonePlugin from '../../lib/restdone.plugin/inc-field.restdone.plugin';
import { BalanceRecordRefModel } from '../../domains/balanceRecordRefModel';

const {
  modelProvider: { Album, Photo, User },
} = app;

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

class PhotoController extends BaseController<
PhotoDocument,
Record<string, any>,
PhotoResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
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
          plugin: incFieldRestdonePlugin.restdone,
          options: {
            model: Photo,
            field: 'viewsCounter',
            extraFieldNames: 'owner',
            afterInc(scope: Scope, resource: PhotoDomain) {
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
          plugin: banContentPlugin.restdone,
          options: {
            Model: Photo,
          },
        },
        {
          plugin: arrayWithCounterPlugin.restdone,
          options: {
            Model: Photo,
            array: 'favoritedUsers',
            path: 'favorites',
            async pre(scope: Scope<PhotoDocument>) {
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
            async afterPut(model: PhotoDocument, scope: Scope<PhotoDocument>) {
              const { params } = scope;
              const photo = await Photo.findOne({ _id: model._id }).lean();

              await User.updateOne(
                { _id: photo.owner },
                { $addToSet: { favoritedUsers: params.itemId } },
              );
            },
          },
        },
      ],
    });
    super(options);
  }

  async pre(scope: Scope<PhotoDocument>): Promise<void> {
    const { params, params: { album: albumId } } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isSelect() && !scope.isAdminMode) {
      params.owner = currentUser.id;
    }
    if (!scope.isSelect() && !scope.isAdminMode) {
      const album = await Album.findOne({ _id: albumId, owner: params.owner }).lean();
      if (!album) {
        throw HTTP_STATUSES.FORBIDDEN.createError();
      }
    }
    if (!scope.isAdminMode) {
      params.$or = [{ suspendedAt: { $exists: false } }, { owner: currentUser._id }];
    }
  }

  queryPipe(query: DocumentQuery<any, PhotoDocument>, scope: Scope<PhotoDocument>) {
    if (scope.isSelect()) {
      if (scope.fieldList.favoritedUsers) {
        query.slice('favoritedUsers', -20);
      }
    }
  }

  async findFavoritePhotosForUser(scope: Scope<PhotoDocument>) {
    const { params, user: currentUser } = scope;
    if (!currentUser) {
      throw new Error('No user');
    }

    const userId = params._id === 'me' ? currentUser.id : params._id;
    const photos = await Photo.findFavoritePhotosForUser(userId);
    return photos;
  }

  assignFilter(
    queryParams: Record<string, any>,
    fieldName: string,
    scope: Scope<PhotoDocument>,
  ) {
    // do not allow not-admins update owner and album
    if ((fieldName === 'owner' || fieldName === 'album') && scope.isUpdate() && !scope.isAdminMode) {
      return false;
    }
    return super.assignFilter(queryParams, fieldName, scope);
  }

  async beforeSave(scope: Scope<PhotoDocument>): Promise<void> {
    if (scope.model.isModified('url')) {
      const { body: { url }, model } = scope;
      // TODO: Integrate with photo processing
      model.publicUrl = url;
    }
  }

  async afterSave(scope: Scope<PhotoDocument>) {
    if (scope.isInsert()) {
      const { model: photo } = scope;
      const recipients = await User.getSubscribersOf(photo.owner);

      await Album.incPhotoCounter(photo.album, 1);
      await app.notificationService.createNotification<{ photo: string }>({
        notificationType: NotificationType.PhotoAdded,
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
  }

  async beforeDelete(scope: Scope<PhotoDocument>) {
    const { model: photo } = scope;
    await Album.incPhotoCounter(photo.album, -1);
  }

  async post(resource: PhotoResource, scope: Scope<PhotoDocument>) {
    return (
      scope.isSelectOne()
        ? this.applySubscriptionRules([resource], scope.user!)[0]
        : resource
    );
  }

  async collectionPost(list: PhotoResource[], scope: Scope<PhotoDocument>) {
    return this.applySubscriptionRules(list, scope.user!);
  }

  applySubscriptionRules(list: PhotoResource[], user: UserDocument) {
    return list.map((item) => (
      user.isSubscribedTo(item.owner._id)
        || user.hasPurchasedContent(BalanceRecordRefModel.Album, item.album?._id)
        ? item
        : <PhotoResource>_.omit(item, ...SUBSCRIBED_ONLY_FIELDS)
    ));
  }
}

exports = PhotoController;
module.exports = PhotoController;
