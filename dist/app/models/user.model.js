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
const validator_1 = __importDefault(require("validator"));
const mongoose_validator_1 = __importDefault(require("mongoose-validator"));
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("app"));
const array_with_counter_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/array-with-counter.restdone.plugin"));
const auth_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/auth.restdone.plugin"));
const ban_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/ban.restdone.plugin"));
const emailVerification_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/emailVerification.restdone.plugin"));
const user_1 = require("../domains/user");
const exceptions_1 = require("../lib/helpers/exceptions");
const idEqual_1 = __importDefault(require("../lib/helpers/idEqual"));
const banning_1 = require("../domains/banning");
const balanceRecordRefModel_1 = require("../domains/balanceRecordRefModel");
const modelName = 'User';
const usernameValidator = [
    {
        validator(value) {
            return validator_1.default.isAlpha(value[0]);
        },
        message: 'Username should start with a letter',
    },
    mongoose_validator_1.default({
        validator: 'isLength',
        arguments: [3, 50],
        message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters',
    }),
    mongoose_validator_1.default({
        validator: 'isAlphanumeric',
        passIfEmpty: true,
        message: 'Username should contain alpha-numeric characters only',
    }),
    mongoose_validator_1.default({
        // username uniqueness validator
        validator(fieldValue) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isNew) {
                    const User = (this.constructor);
                    const existsUser = yield User.findOne({ username: fieldValue }).lean();
                    if (existsUser)
                        throw new Error('User with such username already exists');
                }
            });
        },
    }),
];
const emailValidator = [
    mongoose_validator_1.default({
        validator: 'isEmail',
        message: 'Should be valid email',
    }),
    mongoose_validator_1.default({
        // email uniqueness validator
        validator(fieldValue) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.isNew) {
                    const User = (this.constructor);
                    const existsUser = yield User.findOne({ email: fieldValue }).lean();
                    if (existsUser)
                        throw new Error('User with such email already exists');
                }
            });
        },
    }),
];
const passwordValidator = [
    mongoose_validator_1.default({
        // check if provider is `local`
        validator(fieldValue) {
            return __awaiter(this, void 0, void 0, function* () {
                if (this.provider === 'local' && fieldValue === '') {
                    throw new Error('Password cannot be empty');
                }
            });
        },
    }),
];
/**
 * @swagger
 * components:
 *   schemas:
 *     UserModelRegister:
 *       type: object
 *       properties:
 *         client_id:
 *           type: string
 *         client_secret:
 *           type: string
 *         username:
 *           type: string
 *         password:
 *           type: string
 *         email:
 *           type: string
 *         emailVerified:
 *           type: boolean
 *         subscribers:
 *           type: array
 *           items:
 *             type: string
 *         type:
 *           type: string
 *           enum:
 *             - entrepreneur
 *             - investor
 *         socialMediaLinks:
 *           type: object
 *           properties:
 *              [socialMedia]:
 *                type: object
 *                properties:
 *                  url:
 *                    type: string,
 *         age:
 *           type: number
 *         entrepreneurType:
 *           type: string
 *           enum:
 *             - founder
 *             - employee
 *         arr:
 *           type: object
 *           properties:
 *              value1:
 *                type: number,
 *              value2:
 *                type: number,
 *              value3:
 *                type: number,
 *              value4:
 *                type: number,
 *         mrr:
 *           type: object
 *           properties:
 *              value1:
 *                type: number,
 *              value2:
 *                type: number,
 *         serviceType:
 *           type: string
 *         industry:
 *           type: string
 *         office:
 *           type: string
 *         region:
 *           type: string
 *         pitchDeck:
 *           type: string
 *     UserModelRegisterResponse:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         email:
 *           type: string
 *         activeSubscriptionsCounter:
 *           type: number
 *           description: Counter for active subscriptions
 *         subscriptionsCounter:
 *           type: number
 *           description: Counter for all subscriptions, including canceled ones
 *         socialMediaLinks:
 *           type: object
 *           properties:
 *              [socialMedia]:
 *                type: object
 *                properties:
 *                  url:
 *                    type: string,
 *         age:
 *           type: number
 *         entrepreneurType:
 *           type: string
 *           enum:
 *             - founder
 *             - employee
 *         arr:
 *           type: object
 *           properties:
 *              value1:
 *                type: number,
 *              value2:
 *                type: number,
 *              value3:
 *                type: number,
 *              value4:
 *                type: number,
 *         mrr:
 *           type: object
 *           properties:
 *              value1:
 *                type: number,
 *              value2:
 *                type: number,
 *         serviceType:
 *           type: string
 *         industry:
 *           type: string
 *         office:
 *           type: string
 *         region:
 *           type: string
 *         pitchDeck:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         auth:
 *           type: object
 *           $ref: '#/components/schemas/oAuth'
 *         _id:
 *           type: string
 *     UserModelRefreshToken:
 *       type: object
 *       properties:
 *         client_id:
 *           type: string
 *         client_secret:
 *           type: string
 *         grant_type:
 *           type: string
 *         refresh_token:
 *           type: string
 *     UserModelVerifyEmail:
 *       type: object
 *       properties:
 *         client_id:
 *           type: string
 *         client_secret:
 *           type: string
 *     UserModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         username:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - entrepreneur
 *             - investor
 *         about:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         introVideoUrl:
 *           type: string
 *         fullName:
 *           type: string
 *         birthDate:
 *           type: string
 *         location:
 *           type: array
 *           items:
 *             type: integer
 *         subscribers:
 *           type: array
 *           items:
 *             type: object
 *             $ref: '#/components/schemas/UserModelResponse'
 *         subscribersCounter:
 *           type: integer
 *         subscriptions:
 *           type: object
 *           properties:
 *              targetUser:
 *                type: string,
 *              active:
 *                type: boolean,
 *         subscriptionsCounter:
 *           type: number
 *         favoritedUsers:
 *           type: array
 *           items:
 *             type: object
 *             $ref: '#/components/schemas/UserModelResponse'
 *         favoritedUsersCounter:
 *           type: integer
 *         socialMediaLinks:
 *           type: object
 *           properties:
 *              [socialMedia]:
 *                type: object
 *                properties:
 *                  url:
 *                    type: string,
 *         prices:
 *           type: array
 *           items:
 *            type: object
 *            properties:
 *              period:
 *                type: string
 *              price:
 *                type: number
 *         viewsCounter:
 *           type: integer
 *         notificationSettings:
 *           type: object
 *           properties:
 *             isEmailMuted:
 *               type: boolean
 *             isInAppMuted:
 *               type: boolean
 *         balance:
 *           type: number
 *         age:
 *           type: number
 *         entrepreneurType:
 *           type: string
 *           enum:
 *             - founder
 *             - employee
 *         arr:
 *           type: object
 *           properties:
 *              value1:
 *                type: number,
 *              value2:
 *                type: number,
 *              value3:
 *                type: number,
 *              value4:
 *                type: number,
 *         mrr:
 *           type: object
 *           properties:
 *              value1:
 *                type: number,
 *              value2:
 *                type: number,
 *         serviceType:
 *           type: string
 *         industry:
 *           type: string
 *         office:
 *           type: string
 *         region:
 *           type: string
 *         pitchDeck:
 *           type: string
 *         rating:
 *           type: number
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         suspendedAt:
 *           type: string
 *     oAuth:
 *       type: object
 *       properties:
 *         access_token:
 *           type: string
 *         refresh_token:
 *           type: string
 *         expires_in:
 *           type: integer
 *         token_type:
 *           type: string
 *     UserUpdateBody:
 *       type: object
 *       properties:
 *         about:
 *           type: string
 *         avatar:
 *           type: string
 *         introVideoUrl:
 *           type: string
 *     generalEdit:
 *       type: object
 *       properties:
 *         username:
 *           type: string
 *         about:
 *           type: string
 *         avatarUrl:
 *           type: string
 *         introVideoUrl:
 *           type: string
 *         fullName:
 *           type: string
 *         birthDate:
 *           type: string
 *         publicFields:
 *           type: object
 *           properties:
 *             fullName:
 *               type: boolean
 *             birthDate:
 *               type: boolean
 *             location:
 *               type: boolean
 *         location:
 *           type: array
 *           items:
 *             type: integer
 *     publicUser:
 *       type: array
 *       items:
 *         properties:
 *           _id:
 *             type: string
 *           username:
 *             type: string
 *           type:
 *             type: string
 *           avatarUrl:
 *             type: string
 *           fullName:
 *             type: string
 *           birthDate:
 *             type: string
 *           rating:
 *             type: number
 *     OnboardingPutShowPopup:
 *       type: object
 *       properties:
 *         socialMedia:
 *           type: boolean
 *           properties:
 *             showPopup:
 *               type: boolean
 *     OnboardingResponse:
 *       type: object
 *       properties:
 *         steps:
 *           type: object
 *           properties:
 *             shouldShowPopup:
 *               type: boolean
 *             items:
 *               type: object
 *               properties:
 *                 payout:
 *                   type: object
 *                   $ref: '#/components/schemas/OnboardingItemObject'
 *                 w9:
 *                   type: object
 *                   $ref: '#/components/schemas/OnboardingItemObject'
 *                 stat:
 *                   type: object
 *                   $ref: '#/components/schemas/OnboardingItemObject'
 *                 media:
 *                   type: object
 *                   $ref: '#/components/schemas/OnboardingItemObject'
 *                 payment:
 *                   type: object
 *                   $ref: '#/components/schemas/OnboardingItemObject'
 *                 about:
 *                   type: object
 *                   $ref: '#/components/schemas/OnboardingItemObject'
 *     OnboardingItemObject:
 *       type: object
 *       properties:
 *         isValid:
 *           type: boolean
 *         updatedAt:
 *           type: string
 *     UserCreationError:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *         status:
 *           type: integer
 *         error:
 *           type: string
 *         message:
 *           type: string
 *         details:
 *           type: object
 */
const priceSchema = new mongoose_1.Schema({
    period: {
        type: String,
        required: true,
        enum: user_1.PricePeriodValues,
    },
    price: {
        type: Number,
        required: true,
    },
}, {
    _id: false,
});
const subscriptionSchema = new mongoose_1.Schema({
    targetUser: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    active: {
        type: Boolean,
        default: false,
    },
    billing: {
        subscriptionId: String,
        transactionId: String,
        purchasedTimestamp: String,
        canceledTimestamp: String,
    },
}, {
    _id: false,
});
const purchaseSchema = new mongoose_1.Schema({
    balanceRecord: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'BalanceRecord',
        required: true,
    },
    ref: {
        type: mongoose_1.Schema.Types.ObjectId,
        refPath: 'refModel',
    },
    refModel: {
        type: String,
        enum: balanceRecordRefModel_1.BalanceRecordRefModelValues,
    },
}, {
    _id: false,
});
exports.default = (mongoose) => {
    const notificationSettingsSchema = new mongoose_1.Schema({
        isEmailMuted: Boolean,
        isInAppMuted: Boolean,
    }, {
        _id: false,
    });
    // @ts-ignore
    const schema = new mongoose_1.Schema({
        email: {
            type: String,
            validate: emailValidator,
            unique: 'User with this username already exists',
            required: true,
            trim: true,
            lowercase: true,
        },
        type: {
            type: String,
            enum: user_1.UserTypeValues,
        },
        about: {
            type: String,
        },
        avatarUrl: {
            type: String,
        },
        introVideoUrl: {
            type: String,
            validate: mongoose_validator_1.default({
                validator: 'isURL',
                message: '{PATH} must be URL',
            }),
        },
        fullName: String,
        birthDate: Date,
        location: {
            type: [Number],
            index: '2dsphere',
        },
        socialMedia: {
            showPopup: {
                type: Boolean,
                default: true,
            },
        },
        publicFields: {
            birthDate: Boolean,
            fullName: Boolean,
            location: Boolean,
        },
        admin: Boolean,
        viewsCounter: {
            type: Number,
            default: 0,
        },
        notificationSettings: notificationSettingsSchema,
        balance: {
            type: Number,
            default: 1000,
        },
        timezone: String,
        banningReasonType: {
            type: String,
            enum: banning_1.BanningReasonTypeValues,
        },
        banningReasonDescription: {
            type: String,
        },
        /*
         *  Entrepreneur fields
         */
        socialMediaLinks: user_1.SocialMediaValues.reduce((result, item) => {
            result[item] = {
                url: String,
            };
            return result;
        }, {}),
        prices: [priceSchema],
        age: Number,
        entrepreneurType: {
            type: String,
            enum: user_1.EntrepreneurTypeValues,
        },
        arr: {
            value1: Number,
            value2: Number,
            value3: Number,
            value4: Number,
        },
        mrr: {
            value1: Number,
            value2: Number,
        },
        serviceType: {
            type: String,
            enum: app_1.default.consts.METADATA.dictionaries.serviceTypes.map(({ id }) => id),
        },
        industry: {
            type: String,
            enum: app_1.default.consts.METADATA.dictionaries.industry.map(({ id }) => id),
        },
        office: {
            type: String,
            enum: app_1.default.consts.METADATA.dictionaries.office.map(({ id }) => id),
        },
        region: {
            type: String,
            enum: app_1.default.consts.METADATA.dictionaries.region.map(({ id }) => id),
        },
        pitchDeck: {
            type: String,
            enum: app_1.default.consts.METADATA.dictionaries.pitchDeck.map(({ id }) => id),
        },
        rating: Number,
        /*
         *  Investor fields
         */
        subscriptions: [subscriptionSchema],
        activeSubscriptionsCounter: {
            type: Number,
            default: 0,
        },
        subscriptionsCounter: {
            type: Number,
            default: 0,
        },
        showSubscribersCounter: {
            type: Boolean,
            default: true,
        },
        purchases: [purchaseSchema],
    }, {
        timestamps: true,
    });
    schema.methods.isAdmin = function isAdmin() {
        const user = this;
        return user.admin;
    };
    schema.statics.populateSubscriptions = function populateSubscriptions(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this
                .findById(userId)
                .select('subscriptions')
                .populate('subscriptions.targetUser', 'username avatarUrl');
            return user.subscriptions;
        });
    };
    schema.statics.applyNotificationConfigsRules = function applyNotificationConfigsRules(userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            const users = yield this.find({ _id: { $in: userIds } }).select('_id notificationSettings').lean();
            return users.reduce((result, { _id: userId, notificationSettings }) => {
                if (!(notificationSettings === null || notificationSettings === void 0 ? void 0 : notificationSettings.isEmailMuted)) {
                    result.emailRecipients.push(userId);
                }
                if (!(notificationSettings === null || notificationSettings === void 0 ? void 0 : notificationSettings.isInAppMuted)) {
                    result.inAppRecipients.push(userId);
                }
                return result;
            }, {
                emailRecipients: [],
                inAppRecipients: [],
            });
        });
    };
    schema.statics.getEmails = function getEmails(userIds, extraFieldNames = '') {
        return this.find({ _id: { $in: userIds } }).select(`email ${extraFieldNames}`).lean();
    };
    schema.methods.hasPurchasedContent = function hasPurchasedContent(refModel, ref) {
        if (!ref) {
            return false;
        }
        const user = this;
        const { purchases } = user;
        if (purchases === undefined) {
            throw new exceptions_1.IllegalStateError();
        }
        return purchases
            .some((purchase) => purchase.refModel === refModel
            && idEqual_1.default(purchase.ref, ref));
    };
    schema.methods.isSubscribedTo = function isSubscribedTo(userId) {
        if (idEqual_1.default(this._id, userId)) {
            return true;
        }
        const user = this;
        const { subscriptions } = user;
        if (subscriptions === undefined) {
            throw new exceptions_1.IllegalStateError();
        }
        return subscriptions
            .some((subscription) => idEqual_1.default(subscription.targetUser, userId));
    };
    schema.statics.getSubscribersOf = function getSubscribersOf(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findById(userId).select('subscribers').lean();
            if (!user) {
                throw new Error('Wrong owner');
            }
            return user.subscribers;
        });
    };
    schema.statics.calcSubscriptionsCounters = function calcSubscriptionsCounters(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this.aggregate([
                { $match: { _id: new mongoose_1.Types.ObjectId(userId) } },
                {
                    $project: {
                        activeSubscriptions: {
                            $filter: {
                                input: '$subscriptions',
                                as: 'subscription',
                                cond: {
                                    $eq: ['$$subscription.active', true],
                                },
                            },
                        },
                        subscriptions: true,
                    },
                },
                {
                    $project: {
                        activeSubscriptionsCounter: {
                            $size: '$activeSubscriptions',
                        },
                        subscriptionsCounter: {
                            $size: '$subscriptions',
                        },
                    },
                },
            ]);
            if (!result) {
                throw new Error('No user found');
            }
            return {
                activeSubscriptionsCounter: result[0].activeSubscriptionsCounter,
                subscriptionsCounter: result[0].subscriptionsCounter,
            };
        });
    };
    schema.statics.syncSubscriptionsCounters = function syncSubscriptionsCounters(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this;
            const { activeSubscriptionsCounter, subscriptionsCounter, } = yield user.calcSubscriptionsCounters(userId);
            yield this.updateOne({ _id: userId }, { activeSubscriptionsCounter, subscriptionsCounter });
            return { activeSubscriptionsCounter, subscriptionsCounter };
        });
    };
    schema.statics.incViewsCounter = function incViewsCounter(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this
                .updateOne({ _id: userId }, { $inc: { viewsCounter: 1 } });
        });
    };
    schema.statics.findFavoriteUsersForUser = function findFavoriteUsersForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findById(userId).lean();
            if (!user) {
                throw new Error('Wrong owner');
            }
            return user.favoritedUsers;
        });
    };
    schema.pre('save', function preSave(next) {
        var _a;
        if (this.isNew && !((_a = this.prices) === null || _a === void 0 ? void 0 : _a.length)) {
            this.prices = app_1.default.config.defaultPrices;
        }
        next();
    });
    schema.plugin(array_with_counter_restdone_plugin_1.default.mongoose, {
        array: {
            path: 'subscribers',
            options: [{
                    ref: 'User',
                }],
        },
        mongoose,
    });
    schema.plugin(array_with_counter_restdone_plugin_1.default.mongoose, {
        array: {
            path: 'favoritedUsers',
            options: [{
                    ref: 'User',
                }],
        },
        mongoose,
    });
    schema.plugin(auth_restdone_plugin_1.default.mongoose, {
        mongoose,
        // @ts-ignore
        fields: {
            username: {
                validate: usernameValidator,
            },
            hashedPassword: {
                validate: passwordValidator,
            },
        },
    });
    schema.plugin(emailVerification_restdone_plugin_1.default.mongoose, {
        mongoose,
    });
    /**
     * suspendedAt: Date,
     */
    schema.plugin(ban_restdone_plugin_1.default.mongoose, {
        extraUnbanValues: { $unset: { suspendedAt: '', banningReasonType: '', banningReasonDescription: '' } },
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=user.model.js.map