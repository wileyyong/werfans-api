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
/* eslint-disable @typescript-eslint/no-unused-vars */
const lodash_1 = __importDefault(require("lodash"));
const http_status_node_1 = __importDefault(require("http-status-node"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const auth_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/auth.restdone.plugin"));
const ban_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/ban.restdone.plugin"));
const array_with_counter_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/array-with-counter.restdone.plugin"));
const custom_condition_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/custom-condition.restdone.plugin"));
const me_replacer_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/me-replacer.restdone.plugin"));
const emailVerification_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/emailVerification.restdone.plugin"));
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const app_1 = __importDefault(require("app"));
const user_1 = require("../../domains/user");
const validateSchema_1 = __importDefault(require("../../lib/validateSchema"));
const banning_1 = require("../../domains/banning");
const { config: { security: { tokenLife } }, consts: { RULES: { ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE, WRONG_PRICE, }, }, modelProvider: { LiveStream, Photo, User, Video, }, schemas: { banUserSchema, }, } = app_1.default;
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
class UserController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        const FIELDS = [
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
                fields: user_1.BASE_PUBLIC_FIELDS,
            },
            'subscribersCounter',
            {
                name: 'favoritedUsers',
                fields: user_1.BASE_PUBLIC_FIELDS,
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
            .map((field) => field.name || field)
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
            publicFields: [...user_1.BASE_PUBLIC_FIELDS, ...user_1.EXTRA_PUBLIC_FIELDS],
            actions: {
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
                insert: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER, base_restdone_controller_1.default.AUTH.CLIENT],
                }),
                update: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
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
                    plugin: auth_restdone_plugin_1.default.restdone,
                    options: {
                        Model: User,
                        authenticate: (doc, scope) => this._authenticate(doc, scope),
                    },
                },
                {
                    plugin: emailVerification_restdone_plugin_1.default.restdone,
                    options: {
                        Model: User,
                    },
                },
                {
                    plugin: custom_condition_restdone_plugin_1.default.restdone,
                    options: {
                        name: 'GetSubscribers',
                        path: ':_id/subscribers',
                        prepare(scope) {
                            return __awaiter(this, void 0, void 0, function* () {
                                const currentUser = this.getUserStrict(scope);
                                const { params } = scope;
                                const userId = params._id === 'me' ? currentUser._id : params._id;
                                delete params._id;
                                params.subscriptions = {
                                    $elemMatch: {
                                        targetUser: userId,
                                    },
                                };
                            });
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
                    plugin: ban_restdone_plugin_1.default.restdone,
                    options: {
                        Model: User,
                        afterBan(doc) {
                            return User.logout(doc._id);
                        },
                        getExtraBanValues(scope) {
                            return __awaiter(this, void 0, void 0, function* () {
                                const { body } = scope;
                                const { banningReasonDescription, } = yield validateSchema_1.default(body, banUserSchema);
                                return { banningReasonType: banning_1.BanningReasonType.ByAdmin, banningReasonDescription };
                            });
                        },
                    },
                },
                {
                    plugin: array_with_counter_restdone_plugin_1.default.restdone,
                    options: {
                        Model: User,
                        array: 'favoritedUsers',
                        path: 'favorites',
                        pre(scope) {
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
                        },
                    },
                },
                {
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                },
            ],
        });
        super(options);
        this.authDelegate = this.transports[0].app
            .oAuthdone.authDelegate;
        if (!this.authDelegate) {
            throw new Error('"authDelegate" must be provided');
        }
    }
    publicProfiles(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.select(scope);
        });
    }
    publicProfile(scope) {
        return this.selectOne(scope);
    }
    getFavorites(scope) {
        return this.select(scope);
    }
    onboarding(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.getUserStrict(scope);
            const onboarding = user_1.ONBOARDING[user.type];
            if (!onboarding) {
                throw http_status_node_1.default.NOT_FOUND.createError();
            }
            return onboarding;
        });
    }
    showPopup(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body: { socialMedia } } = scope;
            const user = this.getUserStrict(scope);
            if (undefined !== socialMedia) {
                user.socialMedia = user.socialMedia || {};
                user.socialMedia.showPopup = !!socialMedia;
                yield user.save();
            }
            return {
                message: 'success',
            };
        });
    }
    generateFormUrl(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params: { _id: targetUserId, period }, params } = scope;
            const currentUser = this.getUserStrict(scope);
            delete params.period;
            const { prices } = yield this.locateModel(scope);
            if (!(prices === null || prices === void 0 ? void 0 : prices.length)) {
                throw createAppError_1.default(WRONG_PRICE);
            }
            const foundPriceItem = prices
                .find(({ period: pricePeriod }) => pricePeriod === period);
            if (!foundPriceItem) {
                throw http_status_node_1.default.BAD_REQUEST.createError('Wrong period');
            }
            // TODO: Prefill form
            const url = yield app_1.default.ccBillService.generateFormUrl({
                period,
                price: foundPriceItem.price.toFixed(2),
            }, {
                userId: currentUser._id.toString(),
                targetUserId,
            });
            return {
                url,
            };
        });
    }
    deposit(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params: { summ } } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!parseInt(summ, 10)) {
                throw createAppError_1.default(WRONG_PRICE);
            }
            const roundedPrice = Math.round(parseInt(summ, 10));
            if (roundedPrice < 3 || roundedPrice > 100) {
                throw http_status_node_1.default.BAD_REQUEST.createError('Summ should be between $3 and $100');
            }
            const url = yield app_1.default.ccBillService.generateFormUrl({
                price: `${roundedPrice}.00`,
                period: '90',
            }, {
                userId: currentUser._id.toString(),
                isDeposit: true,
            });
            return {
                url,
            };
        });
    }
    assignFilter(queryParams, fieldName, scope) {
        if (fieldName === 'password' && scope.isUpdate()) {
            return false;
        }
        if (fieldName === 'admin' && !scope.isAdminMode) {
            return false;
        }
        return super.assignFilter(queryParams, fieldName, scope);
    }
    assignField(fieldName, scope) {
        const _super = Object.create(null, {
            assignField: { get: () => super.assignField }
        });
        return __awaiter(this, void 0, void 0, function* () {
            if (fieldName === 'password') {
                scope.model.hashedPassword = yield User.hashPassword(scope.source.password);
                return null;
            }
            else {
                return _super.assignField.call(this, fieldName, scope);
            }
        });
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
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
                    && !scope.isResourceOwner(user._id, params._id)) {
                    throw createAppError_1.default(ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE);
                }
                // do not allow list selecting
                if (scope.isSelect()) {
                    if (!scope.isAdminMode) {
                        if (!scope.isSelectOne() || !scope.isResourceOwner(user._id, params._id)) {
                            throw createAppError_1.default(ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE);
                        }
                    }
                }
                else if (scope.checkActionName('getFavorites')) {
                    if (params.favoritedUsers === 'me') {
                        params.favoritedUsers = user._id;
                    }
                    if (!user.isAdmin() && params.favoritedUsers !== user._id) {
                        throw createAppError_1.default(ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE);
                    }
                }
            }
        });
    }
    getFetchingFields(scope) {
        let result = super.getFetchingFields(scope);
        if (result.subscribersStats && !result.subscribersCounter) {
            result.subscribersCounter = this.fieldMap.subscribersCounter;
            result.showSubscribersCounter = this.fieldMap.showSubscribersCounter;
        }
        if (this.isPublicAction(scope)) {
            result = lodash_1.default.pick(result, 'publicFields', ...this.publicFields);
        }
        return result;
    }
    queryPipe(query, scope) {
        if (scope.isSelect() || this.isPublicAction(scope)) {
            if (scope.fieldList.subscribers) {
                query.slice('subscribers', -20);
            }
            if (scope.fieldList.favoritedUsers) {
                query.slice('favoritedUsers', -20);
            }
        }
    }
    afterSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            // user is signing up
            if (scope.isInsert()) {
                // @ts-ignore
                yield this.sendEmailVerification(scope, scope.model);
                scope.context.auth = yield this._authenticate(scope.model, scope);
            }
        });
    }
    post(user, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope.isInsert() && scope.context.auth) {
                user.auth = scope.context.auth;
            }
            const { user: currentUser, params } = scope;
            if (!currentUser || !user._id.equals(currentUser.id)) {
                delete user.provider;
            }
            if (scope.isSelect() || this.isPublicAction(scope)) {
                if (user.subscriptions && user.subscriptions.length) {
                    yield this.populateSubscriptions(user);
                }
                if (scope.fieldList.stats) {
                    yield this.addStats(user);
                }
                if (scope.fieldList.subscribersStats) {
                    yield this.addSubscribersStats(user);
                }
                if (!user.showSubscribersCounter) {
                    user = lodash_1.default.omit(user, ['subscribersCounter', 'showSubscribersCounter']);
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
                }, []);
                if (currentUser && params._id === currentUser._id) {
                    extraPublicFields.push('emailVerified');
                    extraPublicFields.push('subscribersCounter');
                }
                const fieldsToOmit = lodash_1.default.difference(user_1.EXTRA_PUBLIC_FIELDS, extraPublicFields);
                user = lodash_1.default.omit(user, 'publicFields', ...fieldsToOmit);
            }
            return user;
        });
    }
    _authenticate(user, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            scope.setUser(user);
            const { body } = scope;
            let { client } = scope;
            if (scope.isAdminMode) {
                // for admins we're fetching client data from the request
                client = yield this.authDelegate.findClient({
                    clientId: body.client_id,
                    clientSecret: body.client_secret,
                });
            }
            if (client) {
                const [accessToken, refreshToken] = yield Promise
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
            }
            else {
                return undefined;
            }
        });
    }
    populateSubscriptions(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.subscriptions = yield User.populateSubscriptions(user._id);
        });
    }
    addStats(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.stats = {
                liveStreamsCounter: yield LiveStream.countDocuments({ owner: user._id }),
                photosCounter: yield Photo.countDocuments({ owner: user._id }),
                videosCounter: yield Video.countDocuments({ owner: user._id }),
            };
        });
    }
    addSubscribersStats(user) {
        return __awaiter(this, void 0, void 0, function* () {
            user.subscribersStats = {
                activeCounter: user.subscribersCounter,
                expiredCounter: yield User.countDocuments({
                    subscriptions: {
                        $elemMatch: {
                            active: false,
                            targetUser: user._id,
                        },
                    },
                }),
            };
        });
    }
    isPublicAction(scope) {
        return scope.checkActionName('publicProfile', 'publicProfiles', 'GetSubscribers');
    }
}
module.exports = UserController;
//# sourceMappingURL=user.controller.js.map