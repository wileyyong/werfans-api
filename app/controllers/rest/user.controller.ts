/* eslint-disable @typescript-eslint/no-unused-vars */
import _ from 'lodash';
import { Document, DocumentQuery } from 'mongoose';
import { ExpressTransport, FieldMetadata, FieldMetadataObj } from 'restdone';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import authPlugin from 'app/lib/restdone.plugin/auth.restdone.plugin';
import banPlugin from 'app/lib/restdone.plugin/ban.restdone.plugin';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import customConditionRestdonePlugin from 'app/lib/restdone.plugin/custom-condition.restdone.plugin';
import meReplacerPlugin from 'app/lib/restdone.plugin/me-replacer.restdone.plugin';
import emailVerificationPlugin from 'app/lib/restdone.plugin/emailVerification.restdone.plugin';
import createAppError from 'app/lib/createAppError';
import app from 'app';
import { BASE_PUBLIC_FIELDS, EXTRA_PUBLIC_FIELDS, ONBOARDING, UserDocument, UserResource } from '../../domains/user';
import { Scope } from '../../domains/app';
import { ExtendedExpressApplication } from '../../domains/system';
import { LiveStreamDocument } from '../../domains/liveStream';
import validateSchema from '../../lib/validateSchema';
import { BanningReasonType } from '../../domains/banning';

const {
  config: { security: { tokenLife } },
  consts: {
    RULES: {
      ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE,
      WRONG_PRICE,
    },
  },
  modelProvider: {
    LiveStream,
    Photo,
    User,
    Video,
  },
  schemas: {
    banUserSchema,
  },
} = app;

/**
 * @swagger
 *
 * /users:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Users
 *     summary: List all users
 *     operationId: usersList
 *     responses:
 *       '200':
 *         description: return an array of user objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserModelResponse'
 *   post:
 *     tags:
 *       - Users
 *     summary: Create User
 *     operationId: createUser
 *     requestBody:
 *       description: object containing the properties to create user profile
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserModelRegister'
 *     responses:
 *       '201':
 *         description: return created user object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/UserModelRegisterResponse'
 *       '400':
 *         description: response error
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/UserCreationError'
 * /users/public:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Users
 *     summary: List all users public profiles
 *     operationId: usersListPublic
 *     responses:
 *       '200':
 *         description: return an array of user objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/publicUser'
 * /users/{userId}/public:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Users
 *     summary: get user public profile by userId
 *     operationId: getUserPublicProfile
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut.
 *     responses:
 *       '200':
 *         description: return a user object
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               $ref: '#/components/schemas/publicUser'
 * /users/{userId}:
 *   get:
 *     tags:
 *       - Users
 *     summary: get user profile by userId
 *     operationId: getUser
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut.
 *     responses:
 *       '200':
 *         description: return a user object
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               $ref: '#/components/schemas/UserModelResponse'
 *   patch:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: edit user profile by userId
 *     operationId: updateUser
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut.
 *     requestBody:
 *       description: object containing the properties to edit user profile
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/generalEdit'
 *     responses:
 *       '200':
 *         description: return a user object
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               $ref: '#/components/schemas/UserModelResponse'
 *   delete:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: removes user
 *     operationId: removeUser
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: user id, you can use "me" shortcut.
 *     responses:
 *       '204':
 *         description: Empty response
 * /users/me/onboarding:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Onboarding
 *     summary: Get onboarding status
 *     operationId: onboardingGet
 *     responses:
 *       '200':
 *         description: return a user object
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/OnboardingResponse'
 * /users/me/onboarding/showPopup:
 *   put:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Onboarding
 *     summary: Toggle onboarding show popup
 *     operationId: onboardingPutShowPopup
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: "#/components/schemas/OnboardingPutShowPopup"
 *     responses:
 *       '200':
 *         description: return a user object
 *         content:
 *           application/json:
 *             schema:
 *               properties:
 *                 message:
 *                   type: string
 * /users/{_id}/subscribers:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Subscribers
 *     summary: Gets `subscribers` from user. Returns IDs of users, who subscribed to user.
 *     operationId: getSubscribersById
 *     parameters:
 *       - in: path
 *         name: _id
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *     responses:
 *       '200':
 *         description: returns subscribers ids for _id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: string
 * /users/{userId}/favorited:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get user's favorites users
 *     operationId: GetFavoriteUsers
 *     parameters:
 *       - name: userId
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '200':
 *         description: return a list of users objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserModelResponse'
 * /users/{userId}/favorites:
 *   get:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: get users who added to favorites
 *     operationId: GetUserUsersInFavorites
 *     parameters:
 *       - name: userId
 *         description: user _id
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
 * /users/{userId}/favorites/{targetUser}:
 *   put:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: put to favorites
 *     operationId: AddUserToFavorites
 *     parameters:
 *       - name: userId
 *         description: user _id
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *       - name: targetUser
 *         description: user _id, 'me' accepted too
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       '201':
 *         description: return a list of users who added user to favorites
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
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: delete from favorites
 *     operationId: DeleteUserFromFavorites
 *     parameters:
 *       - name: userId
 *         description: user _id
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
 * /users/verify-email/{token}:
 *   post:
 *     tags:
 *       - Users
 *     summary: Verifies user email.
 *     operationId: verifyEmail
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: restoration token, received in email
 *     requestBody:
 *       description: object containing the properties to restore password
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *     responses:
 *       '204':
 *         description: Empty response
 * /users/resend-verification:
 *   put:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: Resend token for email verification
 *     operationId: resendToken
 *     responses:
 *       '204':
 *         description: Empty response
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UserModelResponse'
 * /users/reset/{token}:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: Resets user password
 *     operationId: resetPassword
 *     parameters:
 *       - name: token
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: restoration token, received in email
 *     requestBody:
 *       description: object containing the properties to restore password
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               newPassword:
 *                 type: string
 *     responses:
 *       '200':
 *         description: returns new token
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/oAuth'
 * /users/forgot:
 *   post:
 *     tags:
 *       - Users
 *     summary: Initiates password restoration, sending reset code to email.
 *     operationId: resendCode
 *     requestBody:
 *       description: object containing the properties to resend restoration code
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               username:
 *                 type: string
 *               client_id:
 *                 type: string
 *               client_secret:
 *                 type: string
 *     responses:
 *       '204':
 *         description: Empty response
 * /users/{userId}/change-password:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: Resets user password.
 *     operationId: changePassword
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID to change password
 *     requestBody:
 *       description: object containing the properties to change password
 *       content:
 *         application/json:
 *           schema:
 *             properties:
 *               password:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       '204':
 *         description: Empty response
 * /users/logout:
 *   post:
 *     tags:
 *       - Users
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     summary: Logout User
 *     operationId: logoutUser
 *     responses:
 *       '204':
 *         description: Empty response
 * /users/{userId}/generateFormUrl/{period}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Users
 *     summary: Generates Form Url for subscription
 *     operationId: generateFormUrl
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID for subscribing to
 *       - name: period
 *         in: path
 *         required: period
 *         schema:
 *           type: string
 *           enum:
 *             - 1
 *             - 30
 *             - 365
 *           description: Period for subscribing
 *     responses:
 *       '200':
 *         description: returns URL
 *         content:
 *           text/plain:
 *            schema:
 *              type: string
 * /users/{userId}/deposit/{summ}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Users
 *     summary: Generates Form Url for deposit
 *     operationId: deposit
 *     parameters:
 *       - name: userId
 *         in: path
 *         required: true
 *         schema:
 *           type: string
 *           description: User ID for subscribing to
 *       - name: summ
 *         in: path
 *         required: period
 *         schema:
 *           type: integer
 *           description: Deposit summ
 *     responses:
 *       '200':
 *         description: returns URL
 *         content:
 *           text/plain:
 *            schema:
 *              type: string
 */

class UserController extends BaseController<UserDocument, Record<string, any>, UserResource> {
  authDelegate: any;

  publicFields?: string[];

  constructor(options = {}) {
    const FIELDS: FieldMetadata[] = [
      'username',
      'password',
      'email',
      'type',
      'about',
      'avatarUrl',
      'introVideoUrl',
      'fullName',
      'birthDate',
      'location',
      'admin',
      'publicFields',
      'emailVerified',
      'viewsCounter',
      'notificationSettings',
      'timezone',
      'balance',
      /*
       *  Entrepreneur fields
       */
      'socialMediaLinks',
      'prices',
      {
        name: 'subscribers',
        fields: BASE_PUBLIC_FIELDS,
      },
      'subscribersCounter',
      {
        name: 'favoritedUsers',
        fields: BASE_PUBLIC_FIELDS,
      },
      'favoritedUsersCounter',
      'age',
      'entrepreneurType',
      'arr',
      'mrr',
      'serviceType',
      'industry',
      'office',
      'region',
      'pitchDeck',
      'rating',
      'banningReasonType',
      'banningReasonDescription',

      /*
       *  Investor fields
       */
      'subscriptions',
      'activeSubscriptionsCounter',
      'subscriptionsCounter',
      'showSubscribersCounter',
      'createdAt',
      'updatedAt',
      'suspendedAt',
      'stats',
      'subscribersStats',
      'auth',
    ];

    const DEFAULT_FIELDS = FIELDS
      .map((field) => (<FieldMetadataObj>field).name || <string>field)
      .filter((field) => field !== 'subscribersCounter' && field !== 'stats' && field !== 'subscribersStats');

    const READ_ONLY_FIELDS = [
      'emailVerified',
      'activeSubscriptionsCounter',
      'subscriptionsCounter',
      'viewsCounter',
      'rating',
      'banningReasonType',
      'banningReasonDescription',
      'favoritedUsers',
      'favoritedUsersCounter',
      'createdAt',
      'updatedAt',
      'suspendedAt',
      'stats',
      'subscribersStats',
      'balance',
    ];

    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: User,
        },
      },
      path: '/users',
      expandForAdmin: true,
      fields: FIELDS,
      qFields: ['username'],
      readOnlyFields: READ_ONLY_FIELDS,
      defaultFields: DEFAULT_FIELDS,
      publicFields: [...BASE_PUBLIC_FIELDS, ...EXTRA_PUBLIC_FIELDS],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        insert: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER, BaseController.AUTH.CLIENT],
        }),
        update: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        publicProfiles: {
          method: 'get',
          path: 'public',
          priority: -1,
        },
        publicProfile: {
          method: 'get',
          path: ':_id/public',
          auth: false,
        },
        onboarding: {
          method: 'get',
          path: 'me/onboarding',
        },
        showPopup: {
          method: 'put',
          path: 'me/onboarding/showPopup',
        },
        generateFormUrl: {
          method: 'get',
          path: ':_id/generateFormUrl/:period',
        },
        deposit: {
          method: 'get',
          path: ':_id/deposit/:summ',
        },
        getFavorites: {
          method: 'get',
          path: ':favoritedUsers/favorited',
        },
      },

      plugins: [
        {
          plugin: authPlugin.restdone,
          options: {
            Model: User,
            authenticate: (doc: UserDocument, scope: Scope) => this._authenticate(doc, scope),
          },
        },
        {
          plugin: emailVerificationPlugin.restdone,
          options: {
            Model: User,
          },
        },
        {
          plugin: customConditionRestdonePlugin.restdone,
          options: {
            name: 'GetSubscribers',
            path: ':_id/subscribers',
            async prepare(this: BaseController, scope: Scope<UserDocument>) {
              const currentUser = this.getUserStrict(scope);
              const { params } = scope;
              const userId = params._id === 'me' ? currentUser._id : params._id;
              delete params._id;
              params.subscriptions = {
                $elemMatch: {
                  targetUser: userId,
                },
              };
            },
          },
        },
        /**
         * @swagger
         *
         * /admin/users/{id}/ban:
         *   post:
         *     tags:
         *       - Users
         *     security:
         *       - Bearer Token: []
         *       - OauthSecurity: []
         *     summary: ban user by id
         *     operationId: usersBan
         *     parameters:
         *       - name: id
         *         in: path
         *         required: true
         *         schema:
         *           type: string
         *           description: user id.
         *     responses:
         *       '204':
         *         description: Empty response
         *
         * /admin/users/{id}/unban:
         *   post:
         *     tags:
         *       - Users
         *     security:
         *       - Bearer Token: []
         *       - OauthSecurity: []
         *     summary: unban user by id
         *     operationId: usersUnban
         *     parameters:
         *       - name: id
         *         in: path
         *         required: true
         *         schema:
         *           type: string
         *           description: user id.
         *     requestBody:
         *       required: true
         *       content:
         *         application/json:
         *           schema:
         *             type: object
         *             properties:
         *               banningReasonDescription:
         *                 type: string
         *     responses:
         *       '204':
         *         description: Empty response
         */
        {
          plugin: banPlugin.restdone,
          options: {
            Model: User,
            afterBan(doc: Document) {
              return User.logout(doc._id);
            },
            async getExtraBanValues(scope: Scope) {
              const { body } = scope;
              const {
                banningReasonDescription,
              } = await validateSchema(body, banUserSchema);
              return { banningReasonType: BanningReasonType.ByAdmin, banningReasonDescription };
            },
          },
        },
        {
          plugin: arrayWithCounterPlugin.restdone,
          options: {
            Model: User,
            array: 'favoritedUsers',
            path: 'favorites',
            pre(scope: Scope<UserDocument>) {
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
          },
        },
        {
          plugin: meReplacerPlugin.restdone,
        },
      ],
    });

    super(options);

    this.authDelegate = (<ExtendedExpressApplication>(<ExpressTransport> this.transports[0]).app)
      .oAuthdone.authDelegate;
    if (!this.authDelegate) {
      throw new Error('"authDelegate" must be provided');
    }
  }

  async publicProfiles(scope: Scope<UserDocument>) {
    return this.select(scope);
  }

  publicProfile(scope: Scope<UserDocument>): Promise<void> {
    return this.selectOne(scope);
  }

  getFavorites(scope: Scope<UserDocument>): Promise<void> {
    return this.select(scope);
  }

  async onboarding(scope: Scope<UserDocument>) {
    const user = this.getUserStrict(scope);
    const onboarding = ONBOARDING[user.type];
    if (!onboarding) {
      throw HTTP_STATUSES.NOT_FOUND.createError();
    }

    return onboarding;
  }

  async showPopup(scope: Scope<UserDocument>) {
    const { body: { socialMedia } } = scope;
    const user = this.getUserStrict(scope);

    if (undefined !== socialMedia) {
      user.socialMedia = user.socialMedia || {};
      user.socialMedia.showPopup = !!socialMedia;

      await user.save();
    }

    return {
      message: 'success',
    };
  }

  async generateFormUrl(scope: Scope<UserDocument>) {
    const { params: { _id: targetUserId, period }, params } = scope;
    const currentUser = this.getUserStrict(scope);
    delete params.period;

    const { prices } = await this.locateModel(scope);
    if (!prices?.length) {
      throw createAppError(WRONG_PRICE);
    }

    const foundPriceItem = prices
      .find(({ period: pricePeriod }: { period: string }) => pricePeriod === period);
    if (!foundPriceItem) {
      throw HTTP_STATUSES.BAD_REQUEST.createError('Wrong period');
    }

    // TODO: Prefill form
    const url = await app.ccBillService.generateFormUrl(
      {
        period,
        price: foundPriceItem.price.toFixed(2),
      },
      {
        userId: currentUser._id.toString(),
        targetUserId,
      },
    );
    return {
      url,
    };
  }

  async deposit(scope: Scope<UserDocument>) {
    const { params: { summ } } = scope;
    const currentUser = this.getUserStrict(scope);

    if (!parseInt(summ, 10)) {
      throw createAppError(WRONG_PRICE);
    }

    const roundedPrice = Math.round(parseInt(summ, 10));

    if (roundedPrice < 3 || roundedPrice > 100) {
      throw HTTP_STATUSES.BAD_REQUEST.createError('Summ should be between $3 and $100');
    }
    const url = await app.ccBillService.generateFormUrl(
      {
        price: `${roundedPrice}.00`,
        period: '90',
      },
      {
        userId: currentUser._id.toString(),
        isDeposit: true,
      },
    );
    return {
      url,
    };
  }

  assignFilter(queryParams: Record<string, any>, fieldName: string, scope: Scope<UserDocument>) {
    if (fieldName === 'password' && scope.isUpdate()) {
      return false;
    }

    if (fieldName === 'admin' && !scope.isAdminMode) {
      return false;
    }

    return super.assignFilter(queryParams, fieldName, scope);
  }

  async assignField(fieldName: string, scope: Scope<UserDocument>): Promise<any> {
    if (fieldName === 'password') {
      scope.model.hashedPassword = await User.hashPassword(scope.source.password);
      return null;
    } else {
      return super.assignField(fieldName, scope);
    }
  }

  async pre(scope: Scope<UserDocument>): Promise<void> {
    const { params, user } = scope;

    if (!scope.isInsert()) {
      if (this.isPublicAction(scope)) {
        return;
      }
      if (!user) {
        throw new Error('Wrong auth');
      }
      if (scope.isChanging()
        && !scope.isAdminMode
        && !scope.isResourceOwner(user._id, params._id)
      ) {
        throw createAppError(ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE);
      }
      // do not allow list selecting
      if (scope.isSelect()) {
        if (!scope.isAdminMode) {
          if (!scope.isSelectOne() || !scope.isResourceOwner(user._id, params._id)) {
            throw createAppError(ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE);
          }
        }
      } else if (scope.checkActionName('getFavorites')) {
        if (params.favoritedUsers === 'me') {
          params.favoritedUsers = user._id;
        }
        if (!user.isAdmin() && params.favoritedUsers !== user._id) {
          throw createAppError(ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE);
        }
      }
    }
  }

  getFetchingFields(scope: Scope<UserDocument>): Record<string, any> {
    let result = super.getFetchingFields(scope);

    if (result.subscribersStats && !result.subscribersCounter) {
      result.subscribersCounter = this.fieldMap.subscribersCounter;
      result.showSubscribersCounter = this.fieldMap.showSubscribersCounter;
    }

    if (this.isPublicAction(scope)) {
      result = _.pick(result, 'publicFields', ...<string[]> this.publicFields);
    }

    return result;
  }

  queryPipe(query: DocumentQuery<any, LiveStreamDocument>, scope: Scope<UserDocument>) {
    if (scope.isSelect() || this.isPublicAction(scope)) {
      if (scope.fieldList.subscribers) {
        query.slice('subscribers', -20);
      }
      if (scope.fieldList.favoritedUsers) {
        query.slice('favoritedUsers', -20);
      }
    }
  }

  async afterSave(scope: Scope<UserDocument>) {
    // user is signing up
    if (scope.isInsert()) {
      // @ts-ignore
      await this.sendEmailVerification(scope, scope.model);
      scope.context.auth = await this._authenticate(scope.model, scope);
    }
  }

  async post(user: Record<string, any>, scope: Scope<UserDocument>): Promise<UserResource> {
    if (scope.isInsert() && scope.context.auth) {
      user.auth = scope.context.auth;
    }
    const { user: currentUser, params } = scope;
    if (!currentUser || !user._id.equals(currentUser.id)) {
      delete user.provider;
    }

    if (scope.isSelect() || this.isPublicAction(scope)) {
      if (user.subscriptions && user.subscriptions.length) {
        await this.populateSubscriptions(user);
      }
      if (scope.fieldList.stats) {
        await this.addStats(user);
      }
      if (scope.fieldList.subscribersStats) {
        await this.addSubscribersStats(user);
      }
      if (!user.showSubscribersCounter) {
        user = _.omit(user, ['subscribersCounter', 'showSubscribersCounter']);
      }
    }

    // apply privacy settings
    if (this.isPublicAction(scope)) {
      const extraPublicFields = Object.entries(user.publicFields || {})
        .reduce((result, [key, value]) => {
          if (value) {
            result.push(key);
          }
          return result;
        }, [] as string[]);

      if (currentUser && params._id === currentUser._id) {
        extraPublicFields.push('emailVerified');
        extraPublicFields.push('subscribersCounter');
      }

      const fieldsToOmit = _.difference(EXTRA_PUBLIC_FIELDS, extraPublicFields);
      user = _.omit(user, 'publicFields', ...fieldsToOmit);
    }

    return user as UserResource;
  }

  async _authenticate(user: UserDocument, scope: Scope) {
    scope.setUser(user);
    const { body } = scope;
    let { client } = scope;
    if (scope.isAdminMode) {
      // for admins we're fetching client data from the request
      client = await this.authDelegate.findClient({
        clientId: body.client_id,
        clientSecret: body.client_secret,
      });
    }

    if (client) {
      const [accessToken, refreshToken] = await Promise
        .all([
          this.authDelegate.createAccessToken({ user, client }),
          this.authDelegate.createRefreshToken({ user, client }),
        ]);
      return {
        access_token: accessToken,
        refresh_token: refreshToken,
        expires_in: tokenLife,
        token_type: 'bearer',
      };
    } else {
      return undefined;
    }
  }

  private async populateSubscriptions(user: Record<string, any>) {
    user.subscriptions = await User.populateSubscriptions(user._id);
  }

  private async addStats(user: Record<string, any>) {
    user.stats = {
      liveStreamsCounter: await LiveStream.countDocuments({ owner: user._id }),
      photosCounter: await Photo.countDocuments({ owner: user._id }),
      videosCounter: await Video.countDocuments({ owner: user._id }),
    };
  }

  private async addSubscribersStats(user: Record<string, any>) {
    user.subscribersStats = {
      activeCounter: user.subscribersCounter,
      expiredCounter: await User.countDocuments({
        subscriptions: {
          $elemMatch: {
            active: false,
            targetUser: user._id,
          },
        },
      }),
    };
  }

  private isPublicAction(scope: Scope<UserDocument>): boolean {
    return scope.checkActionName(
      'publicProfile',
      'publicProfiles',
      'GetSubscribers',
    );
  }
}

module.exports = UserController;
