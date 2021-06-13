import validator from 'validator';
import validate from 'mongoose-validator';
import { Model, Mongoose, Schema, SchemaDefinition, Types } from 'mongoose';

import app from 'app';
import arrayWithCounterPlugin from 'app/lib/restdone.plugin/array-with-counter.restdone.plugin';
import authPlugin from 'app/lib/restdone.plugin/auth.restdone.plugin';
import { MongooseOptions as AuthMongooseOptions } from 'app/lib/restdone.plugin/auth.restdone.plugin/auth.restdone.plugin';
import banPlugin from 'app/lib/restdone.plugin/ban.restdone.plugin';
import emailVerificationPlugin from 'app/lib/restdone.plugin/emailVerification.restdone.plugin';
import {
  EntrepreneurTypeValues,
  NotificationConfigsRules,
  PricePeriodValues,
  SocialMedia,
  SocialMediaValues,
  UserDocument, UserPurchase,
  UserResource,
  UserSubscription,
  UserTypeValues,
} from '../domains/user';
import { IllegalStateError } from '../lib/helpers/exceptions';
import idEqual from '../lib/helpers/idEqual';
import { BanningReasonTypeValues } from '../domains/banning';
import { BalanceRecordRefModel, BalanceRecordRefModelValues } from '../domains/balanceRecordRefModel';

const modelName = 'User';

const usernameValidator = [
  {
    validator(value: string) {
      return validator.isAlpha(value[0]);
    },
    message: 'Username should start with a letter',
  },
  validate({
    validator: 'isLength',
    arguments: [3, 50],
    message: 'Username should be between {ARGS[0]} and {ARGS[1]} characters',
  }),
  validate({
    validator: 'isAlphanumeric',
    passIfEmpty: true,
    message: 'Username should contain alpha-numeric characters only',
  }),
  validate({
    // username uniqueness validator
    async validator(fieldValue: string) {
      if (this.isNew) {
        const User = <Model<any>>(this.constructor);
        const existsUser = await User.findOne({ username: fieldValue }).lean();

        if (existsUser) throw new Error('User with such username already exists');
      }
    },
  }),
];

const emailValidator = [
  validate({
    validator: 'isEmail',
    message: 'Should be valid email',
  }),
  validate({
    // email uniqueness validator
    async validator(fieldValue: string) {
      if (this.isNew) {
        const User = <Model<any>>(this.constructor);
        const existsUser = await User.findOne({ email: fieldValue }).lean();

        if (existsUser) throw new Error('User with such email already exists');
      }
    },
  }),
];

const passwordValidator = [
  validate({
    // check if provider is `local`
    async validator(fieldValue: string) {
      if ((<UserDocument><unknown> this).provider === 'local' && fieldValue === '') {
        throw new Error('Password cannot be empty');
      }
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

const priceSchema = new Schema({
  period: {
    type: String,
    required: true,
    enum: PricePeriodValues,
  },
  price: {
    type: Number,
    required: true,
  },
}, {
  _id: false,
});

const subscriptionSchema = new Schema({
  targetUser: {
    type: Schema.Types.ObjectId,
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

const purchaseSchema = new Schema({
  balanceRecord: {
    type: Schema.Types.ObjectId,
    ref: 'BalanceRecord',
    required: true,
  },
  ref: {
    type: Schema.Types.ObjectId,
    refPath: 'refModel',
  },
  refModel: {
    type: String,
    enum: BalanceRecordRefModelValues,
  },
}, {
  _id: false,
});

export default (mongoose: Mongoose) => {
  const notificationSettingsSchema = new Schema({
    isEmailMuted: Boolean,
    isInAppMuted: Boolean,
  }, {
    _id: false,
  });
  // @ts-ignore
  const schema: Schema = new Schema({
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
      enum: UserTypeValues,
    },
    about: {
      type: String,
    },
    avatarUrl: {
      type: String,
    },
    introVideoUrl: {
      type: String,
      validate: validate({
        validator: 'isURL',
        message: '{PATH} must be URL',
      }),
    },
    fullName: String,
    birthDate: Date,
    location: {
      type: [Number], // longitude, latitude
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
      enum: BanningReasonTypeValues,
    },
    banningReasonDescription: {
      type: String,
    },
    /*
     *  Entrepreneur fields
     */
    socialMediaLinks: SocialMediaValues.reduce(
      (result, item) => {
        result[item] = {
          url: String,
        };
        return result;
      },
      <Record<SocialMedia, SchemaDefinition>>{},
    ),
    prices: [priceSchema],

    age: Number,
    entrepreneurType: {
      type: String,
      enum: EntrepreneurTypeValues,
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
      enum: app.consts.METADATA.dictionaries.serviceTypes.map(({ id }) => id),
    },
    industry: {
      type: String,
      enum: app.consts.METADATA.dictionaries.industry.map(({ id }) => id),
    },
    office: {
      type: String,
      enum: app.consts.METADATA.dictionaries.office.map(({ id }) => id),
    },
    region: {
      type: String,
      enum: app.consts.METADATA.dictionaries.region.map(({ id }) => id),
    },
    pitchDeck: {
      type: String,
      enum: app.consts.METADATA.dictionaries.pitchDeck.map(({ id }) => id),
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
    const user = <UserDocument>this
    return user.admin;
  };

  schema.statics.populateSubscriptions = async function populateSubscriptions(
    userId: string | Types.ObjectId,
  ) {
    const user = await this
      .findById(userId)
      .select('subscriptions')
      .populate('subscriptions.targetUser', 'username avatarUrl');

    return user.subscriptions;
  };

  schema.statics.applyNotificationConfigsRules = async function applyNotificationConfigsRules(
    userIds: string[] | Types.ObjectId[],
  ): Promise<NotificationConfigsRules> {
    const users = await this.find({ _id: { $in: userIds } }).select('_id notificationSettings').lean();
    return users.reduce(
      (result: NotificationConfigsRules, { _id: userId, notificationSettings }: UserDocument) => {
        if (!notificationSettings?.isEmailMuted) {
          result.emailRecipients.push(userId);
        }
        if (!notificationSettings?.isInAppMuted) {
          result.inAppRecipients.push(userId);
        }
        return result;
      },
      <NotificationConfigsRules>{
        emailRecipients: [],
        inAppRecipients: [],
      },
    );
  };

  schema.statics.getEmails = function getEmails(
    userIds: string[],
    extraFieldNames: string = '',
  ): Promise<UserResource> {
    return this.find({ _id: { $in: userIds } }).select(`email ${extraFieldNames}`).lean();
  };

  schema.methods.hasPurchasedContent = function hasPurchasedContent(
    refModel: BalanceRecordRefModel,
    ref: string | Types.ObjectId | undefined,
  ) {
    if (!ref) {
      return false;
    }
    const user = <UserDocument>this
 
    const { purchases } = user;
    if (purchases === undefined) {
      throw new IllegalStateError();
    }
    return (<UserPurchase[]>purchases)
      .some((purchase) => purchase.refModel === refModel
        && idEqual(purchase.ref, ref));
  };

  schema.methods.isSubscribedTo = function isSubscribedTo(userId: string | Types.ObjectId) {
    if (idEqual(this._id, userId)) {
      return true;
    }
    const user = <UserDocument>this
 
    const { subscriptions } = user;
    if (subscriptions === undefined) {
      throw new IllegalStateError();
    }
    return (<UserSubscription[]>subscriptions)
      .some((subscription) => idEqual(subscription.targetUser, userId));
  };

  schema.statics.getSubscribersOf = async function getSubscribersOf(
    userId: string | Types.ObjectId,
  ): Promise<string[]> {
    const user = await this.findById(userId).select('subscribers').lean();
    if (!user) {
      throw new Error('Wrong owner');
    }
    return user.subscribers;
  };

  schema.statics.calcSubscriptionsCounters = async function calcSubscriptionsCounters(
    userId: string,
  ): Promise<{
      activeSubscriptionsCounter: number;
      subscriptionsCounter: number;
    }> {
    const result = await this.aggregate([
      { $match: { _id: new Types.ObjectId(userId) } },
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
  };

  schema.statics.syncSubscriptionsCounters = async function syncSubscriptionsCounters(
    userId: string,
  ) : Promise<{ activeSubscriptionsCounter: number; subscriptionsCounter: number; }> {
    const user = <UserDocument><unknown>this;
    const {
      activeSubscriptionsCounter,
      subscriptionsCounter,
    } = await user.calcSubscriptionsCounters(userId);
    await this.updateOne({ _id: userId }, { activeSubscriptionsCounter, subscriptionsCounter });
    return { activeSubscriptionsCounter, subscriptionsCounter };
  };

  schema.statics.incViewsCounter = async function incViewsCounter(
    userId: string,
  ): Promise<unknown> {
    return this
      .updateOne(
        { _id: userId },
        { $inc: { viewsCounter: 1 } },
      );
  };

  schema.statics.findFavoriteUsersForUser = async function findFavoriteUsersForUser(
    userId: string,
  ): Promise<string[]> {
    const user = await this.findById(userId).lean();
    if (!user) {
      throw new Error('Wrong owner');
    }
    return user.favoritedUsers;
  };

  schema.pre<UserDocument>('save', function preSave(next) {
    if (this.isNew && !this.prices?.length) {
      this.prices = app.config.defaultPrices;
    }
    next();
  });

  schema.plugin(arrayWithCounterPlugin.mongoose, {
    array: {
      path: 'subscribers',
      options: [{
        ref: 'User',
      }],
    },
    mongoose,
  });

  schema.plugin(arrayWithCounterPlugin.mongoose, {
    array: {
      path: 'favoritedUsers',
      options: [{
        ref: 'User',
      }],
    },
    mongoose,
  });

  schema.plugin(authPlugin.mongoose, {
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

  schema.plugin(emailVerificationPlugin.mongoose, {
    mongoose,
  });

  /**
   * suspendedAt: Date,
   */
  schema.plugin(banPlugin.mongoose, {
    extraUnbanValues: { $unset: { suspendedAt: '', banningReasonType: '', banningReasonDescription: '' } },
  });

  return mongoose.model<UserDocument>(modelName, schema);
};
