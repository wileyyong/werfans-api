import { Document, Model, Types } from 'mongoose';
import { AuthResource } from './auth';
import { Banning, BanningModel } from './banning';
import { BalanceRecordRefModel } from './balanceRecordRefModel';

export interface NotificationConfigsRules {
  inAppRecipients: string[];
  emailRecipients: string[];
}

export interface UserModel extends BanningModel, Model<UserDocument> {
  hashPassword(password: string): string;
  logout(id: string): Promise<void>;
  getSubscribersOf(userId: string | Types.ObjectId): Promise<string[]>;
  applyNotificationConfigsRules(
    userIds: string[] | Types.ObjectId[]
  ): Promise<NotificationConfigsRules>;
  getEmails(userIds: string[], extraFieldNames: string): Promise<UserResource[]>;
  calcSubscriptionsCounters(userId: string): Promise<{
    activeSubscriptionsCounter: number;
    subscriptionsCounter: number;
  }>;
  syncSubscriptionsCounters(userId: string): Promise<{
    activeSubscriptionsCounter: number;
    subscriptionsCounter: number;
  }>;
  incViewsCounter(userId: string): Promise<unknown>;
  findSubscribersForUser(userId: string): Promise<string[]>;
  findFavoriteUsersForUser(userId: string): Promise<string[]>;
  populateSubscriptions(userId: string | Types.ObjectId): Promise<Record<string, any>[]>;
}

export const BASE_PUBLIC_FIELDS = [
  '_id',
  'username',
  'type',
  'about',
  'avatarUrl',
  'prices',
  'introVideoUrl',
  'activeSubscriptionsCounter',
  'subscriptionsCounter',
  'viewsCounter',
  'socialMediaLinks',
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
  'stats',
  'subscribersCounter',
];

export const EXTRA_PUBLIC_FIELDS = [
  'birthDate',
  'fullName',
  'location',
  'emailVerified',
  'showSubscribersCounter',
];

const ENTREPRENEUR_ONBOARDING = {
  steps: {
    shouldShowPopup: true,
    items: {
      payout: {
        isValid: false,
        updatedAt: null,
      },
      w9: {
        isValid: false,
        updatedAt: null,
      },
      stat: {
        isValid: false,
        updatedAt: null,
      },
      media: {
        isValid: false,
        updatedAt: null,
      },
      payment: {
        isValid: false,
        updatedAt: null,
      },
      about: {
        isValid: false,
        updatedAt: null,
      },
    },
  },
};

const INVESTOR_ONBOARDING = {
  steps: {
    shouldShowPopup: true,
    items: {
      paymentMethod: {
        isValid: false,
        updatedAt: null,
      },
      validCreditRemaining: {
        isValid: false,
        updatedAt: null,
      },
      media: {
        isValid: false,
        updatedAt: null,
      },
      about: {
        isValid: false,
        updatedAt: null,
      },
    },
  },
};

type EntrepreneurOnboarding = typeof ENTREPRENEUR_ONBOARDING & {
  socialMedia: UserDomain['socialMedia'];
};

type InvestorOnboarding = typeof INVESTOR_ONBOARDING & {
  socialMedia: UserDomain['socialMedia'];
};

export enum UserType {
  Entrepreneur = 'entrepreneur',
  Investor = 'investor'
}

export enum EntrepreneurType {
  Founder = 'founder',
  Employee = 'employee'
}

export const EntrepreneurTypeValues: EntrepreneurType[] = Object
  .values(EntrepreneurType)
  .filter((x) => typeof x === 'string');

export const UserTypeValues: UserType[] = Object
  .values(UserType)
  .filter((x) => typeof x === 'string');

export const ONBOARDING = {
  [UserType.Entrepreneur]: ENTREPRENEUR_ONBOARDING,
  [UserType.Investor]: INVESTOR_ONBOARDING,
};

type Token = {
  token: string;
  expires: string | Date;
};

export enum PricePeriod {
  Daily = '1',
  Monthly = '30',
  Annual = '365'
}

export const PricePeriodValues: PricePeriod[] = Object
  .values(PricePeriod)
  .filter((x) => typeof x === 'string');

interface Price {
  period: PricePeriod;
  price: number;
}

export interface UserPurchase {
  balanceRecord: string;
  ref: string;
  refModel: BalanceRecordRefModel;
}

export interface UserSubscription {
  active: boolean;
  billing: Billing;
  targetUser: string;
}

interface Billing {
  subscriptionId: string;
  transactionId: string;
  purchasedTimestamp: string;
  canceledTimestamp?: string;
}

export enum SocialMedia {
  Facebook = 'facebook',
  Instagram = 'instagram',
  Linkedin = 'linkedin',
  Snapchat = 'snapchat',
  Tumblr = 'tumblr',
  Youtube = 'youtube'
}

export const SocialMediaValues: SocialMedia[] = Object
  .values(SocialMedia)
  .filter((x) => typeof x === 'string');

type SocialMediaLinks = {
  [key in SocialMedia]: string;
};

interface NotificationSettings {
  isEmailMuted?: boolean;
  isInAppMuted?: boolean;
}

export interface UserDomain extends Banning {
  username: string;
  password: string;
  email: string;
  provider: 'local';
  resetPassword?: Token;
  type: UserType;
  about?: string;
  avatarUrl?: string;
  introVideoUrl?: string;
  admin?: boolean;
  hashedPassword?: string;
  suspendedAt?: string;
  createdAt?: string;
  updatedAt?: string;
  fullName?: string;
  birthDate?: string | Date;
  location?: [number, number] | null; // longitude, latitude
  socialMedia?: {
    showPopup?: boolean;
  };
  publicFields: Record<'birthDate' | 'fullName' | 'location', boolean>;
  emailVerified?: true;
  emailVerification?: Token;
  timezone?: string;
  viewsCounter: number;
  notificationSettings?: NotificationSettings;
  balance: number;

  /*
   *  Entrepreneur fields
   */
  socialMediaLinks: SocialMediaLinks;
  prices: Price[];
  subscribers: string[];
  subscribersCounter: number;
  showSubscribersCounter: boolean;
  age?: Number;
  entrepreneurType?: EntrepreneurType;
  // TODO: rename fields
  arr?: {
    value1: number;
    value2: number;
    value3: number;
    value4: number;
  };
  // TODO: rename fields
  mrr?: {
    value1: number;
    value2: number;
  };
  // TODO: Add typing
  serviceType?: string;
  // TODO: Add typing
  industry?: string;
  // TODO: Add typing
  office?: string;
  // TODO: Add typing
  region?: string;
  // TODO: Add typing
  pitchDeck?: string;

  rating?: number;

  /*
   *  Investor fields
   */
  subscriptions: UserSubscription[];
  subscriptionsCounter: number;
  purchases: UserPurchase[];
  activeSubscriptionsCounter: number;
  favoritedUsers: string[];
  favoritedUsersCounter: number;
}

export interface UserDocument extends Omit<UserDomain, 'subscribers'>, Document {
  isAdmin(): boolean;

  /**
   * Returns true if user purchased content with "refModel" and id == "ref"
   * @param refModel
   * @param ref
   */
  hasPurchasedContent(
    refModel: BalanceRecordRefModel,
    ref: string | Types.ObjectId,
  ): boolean;

  /**
   * Returns true for all subscribers and this user by himself
   * @param userId
   */
  isSubscribedTo(userId: string): boolean;
  authenticate(password: string): boolean;
  subscribers: Types.Array<Types.ObjectId>;
  calcSubscriptionsCounters(userId: string):  Promise<{ activeSubscriptionsCounter: number; subscriptionsCounter: number; }>
}

export type UserResource = Omit<
UserDomain,
'password' & 'isAdmin' & 'hashedPassword' & 'provider' & 'socialMedia' & 'subscribers' & 'subscribersCounter' & 'emailVerification' & 'favoritedUsers' & 'favoritedUsersCounter'
> & {
  _id: string;
  auth?: AuthResource;
};

export type PublicUserResource = Pick<UserResource, '_id' & 'username' & 'type' & 'avatarUrl' & 'birthDate' & 'fullName' & 'location'>;

export type OnboardingResource = EntrepreneurOnboarding | InvestorOnboarding;
