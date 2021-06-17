"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const { FORBIDDEN, NOT_FOUND } = require('http-status-node');
const consts = {
    AUTH: {
        BASIC: 'basic',
        BEARER: 'bearer',
        CLIENT: 'oauth2-client-password',
    },
    CONNECTOR_TYPE: {
        UNKNOWN: -1,
        EVENT: 0,
        SIGNAL: 1,
        DATA_SOURCE: 2,
    },
    RULES: {
        ACCOUNT_ALREADY_EXISTS: {
            name: 'AccountAlreadyExists',
            message: 'Account for this chain already exists',
        },
        ALLOW_FOR_ADMIN_ONLY_RULE: {
            name: 'AllowForAdminOnly',
            message: 'The action is allowed for admins only',
            httpStatus: FORBIDDEN,
        },
        ALLOW_FOR_OWNER_OR_ADMIN_ONLY_RULE: {
            name: 'AllowForOwnerOrAdminOnlyRule',
            message: 'The action is allowed for owner or admins only',
            httpStatus: FORBIDDEN,
        },
        ALLOW_FOR_OWNER_ONLY_RULE: {
            name: 'AllowForOwnerOnlyRule',
            message: 'The action is allowed for owner only',
            httpStatus: FORBIDDEN,
        },
        CANNOT_CHANGE_FIELD: {
            name: 'CannotChangeField',
            message: 'Cannot change field',
        },
        CANNOT_FIND_MATCHING_RESOURCE: {
            name: 'NoMatchingResourceFound',
            message: 'No matching resource found',
            httpStatus: NOT_FOUND,
        },
        DUPLICATE_USER_USERNAME: {
            name: 'DuplicateUser',
            message: 'User with such username already exists',
        },
        DUPLICATE_USER_EMAIL: {
            name: 'DuplicateUser',
            message: 'User with such email already exists',
        },
        FORBIDDEN_FOR_BANNED_USER: {
            name: 'ForbiddenForBannedUser',
            message: 'Forbidden for banned user',
            httpStatus: FORBIDDEN,
        },
        INVALID_STATE: {
            name: 'InvalidState',
            message: 'Invalid state',
        },
        INVALID_STATE_TRANSITION: {
            name: 'InvalidStateTransition',
            message: 'Invalid state transition',
        },
        MANDATORY_PARAM_IS_MISSING: {
            name: 'MandatoryParamIsMissing',
            message: 'Mandatory param is missing',
        },
        NO_ACCOUNT_DATA: {
            name: 'NoAccountData',
            message: 'No account data. Please, specify chain account data',
        },
        NOT_ENOUGH_BALANCE: {
            name: 'NotEnoughBalance',
            message: 'Not Enough Balance',
        },
        NOT_SALABLE: {
            name: 'NotSalable',
            message: 'Not Salable',
        },
        NOT_SUPPORTED: {
            name: 'NotSupported',
            message: 'Not Supported',
        },
        WRONG_PRICE: {
            name: 'WrongPrice',
            message: 'Wrong Price',
        },
        WRONG_SUM: {
            name: 'WrongSum',
            message: 'Wrong Sum',
        },
    },
    METADATA: {
        dictionaries: {
            serviceTypes: [
                {
                    id: 'b2b',
                    name: 'b2b',
                },
                {
                    id: 'saas',
                    name: 'saas',
                },
                {
                    id: 'ecommerce',
                    name: 'ecommerce',
                },
                {
                    id: 'social media',
                    name: 'social media',
                },
            ],
            industry: [
                {
                    id: 'agile',
                    name: 'agile',
                },
                {
                    id: 'scrum',
                    name: 'scrum',
                },
                {
                    id: 'hackathon',
                    name: 'hackathon',
                },
            ],
            office: [
                {
                    id: 'home',
                    name: 'Home',
                },
                {
                    id: 'coworking',
                    name: 'Co-Working',
                },
                {
                    id: 'privateOffice',
                    name: 'Private Office',
                },
            ],
            region: [
                {
                    id: 'asia',
                    name: 'Asia',
                },
                {
                    id: 'northAmerica',
                    name: 'North America',
                },
                {
                    id: 'africa',
                    name: 'Africa',
                },
                {
                    id: 'southAmerica',
                    name: 'South America',
                },
                {
                    id: 'europe',
                    name: 'Europe',
                },
            ],
            pitchDeck: [
                {
                    id: 'ab',
                    name: 'ab',
                },
                {
                    id: 'aa',
                    name: 'aa',
                },
                {
                    id: 'ac',
                    name: 'ac',
                },
            ],
        },
    },
    events: {
        liveStreams: {
            completed: 'liveStream.completed',
        },
        payment: {
            accepted: 'payment.accepted',
        },
        strikes: {
            created: 'strike.created',
            revoked: 'strike.revoked',
        },
    },
};
exports.default = consts;
module.exports = consts;
//# sourceMappingURL=consts.js.map