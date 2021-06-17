"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_status_node_1 = __importDefault(require("http-status-node"));
const { NOT_FOUND } = http_status_node_1.default;
const consts = {
    RULES: {
        ALREADY_VERIFIED_RULE: {
            name: 'AlreadyVerified',
            message: 'This user already verified email address',
        },
        WRONG_TOKEN_RULE: {
            name: 'WrongToken',
            message: 'The token is wrong',
        },
        USER_NOT_FOUND: {
            name: 'UserNotFound',
            message: 'User with specified username cannot be found',
            httpStatus: NOT_FOUND,
        },
    },
};
exports.default = consts;
//# sourceMappingURL=emailVerification.consts.js.map