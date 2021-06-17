"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SocialMediaValues = exports.SocialMedia = exports.PricePeriodValues = exports.PricePeriod = exports.ONBOARDING = exports.UserTypeValues = exports.EntrepreneurTypeValues = exports.EntrepreneurType = exports.UserType = exports.EXTRA_PUBLIC_FIELDS = exports.BASE_PUBLIC_FIELDS = void 0;
exports.BASE_PUBLIC_FIELDS = [
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
exports.EXTRA_PUBLIC_FIELDS = [
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
var UserType;
(function (UserType) {
    UserType["Entrepreneur"] = "entrepreneur";
    UserType["Investor"] = "investor";
})(UserType = exports.UserType || (exports.UserType = {}));
var EntrepreneurType;
(function (EntrepreneurType) {
    EntrepreneurType["Founder"] = "founder";
    EntrepreneurType["Employee"] = "employee";
})(EntrepreneurType = exports.EntrepreneurType || (exports.EntrepreneurType = {}));
exports.EntrepreneurTypeValues = Object
    .values(EntrepreneurType)
    .filter((x) => typeof x === 'string');
exports.UserTypeValues = Object
    .values(UserType)
    .filter((x) => typeof x === 'string');
exports.ONBOARDING = {
    [UserType.Entrepreneur]: ENTREPRENEUR_ONBOARDING,
    [UserType.Investor]: INVESTOR_ONBOARDING,
};
var PricePeriod;
(function (PricePeriod) {
    PricePeriod["Daily"] = "1";
    PricePeriod["Monthly"] = "30";
    PricePeriod["Annual"] = "365";
})(PricePeriod = exports.PricePeriod || (exports.PricePeriod = {}));
exports.PricePeriodValues = Object
    .values(PricePeriod)
    .filter((x) => typeof x === 'string');
var SocialMedia;
(function (SocialMedia) {
    SocialMedia["Facebook"] = "facebook";
    SocialMedia["Instagram"] = "instagram";
    SocialMedia["Linkedin"] = "linkedin";
    SocialMedia["Snapchat"] = "snapchat";
    SocialMedia["Tumblr"] = "tumblr";
    SocialMedia["Youtube"] = "youtube";
})(SocialMedia = exports.SocialMedia || (exports.SocialMedia = {}));
exports.SocialMediaValues = Object
    .values(SocialMedia)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=user.js.map