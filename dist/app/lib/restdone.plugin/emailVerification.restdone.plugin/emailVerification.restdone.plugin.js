"use strict";
/**
 * Created by mk on 02/07/16.
 */
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
const crypto_1 = __importDefault(require("crypto"));
const url_1 = require("url");
const app_1 = __importDefault(require("app"));
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const fromCallback_1 = __importDefault(require("app/lib/helpers/fromCallback"));
const emailVerification_consts_1 = __importDefault(require("./emailVerification.consts"));
const email_1 = require("../../../domains/email");
const { RULES: { ALREADY_VERIFIED_RULE, WRONG_TOKEN_RULE, }, } = emailVerification_consts_1.default;
const { config } = app_1.default;
function mongooseFn(schema) {
    schema.add({
        emailVerified: {
            type: Boolean,
            default: false,
        },
        emailVerification: {
            token: String,
            expires: Date,
        },
    });
}
function restdoneFn(restdoneController, options) {
    const { Model } = options;
    // @ts-ignore
    restdoneController.sendEmailVerification = function sendEmailVerification(scope, user) {
        return __awaiter(this, void 0, void 0, function* () {
            const buffer = yield fromCallback_1.default((callback) => {
                crypto_1.default.randomBytes(20, callback);
            });
            user.emailVerification = {
                token: buffer.toString('hex'),
                expires: `${Date.now() + (1000 * config.security.emailVerificationTokenLife)}`,
            };
            const { origin } = new url_1.URL(scope.referrer || '');
            const baseUrl = `${origin}/${config.urls.verifyEmail}`;
            yield user.save();
            yield app_1.default.emailService.sendEmail(email_1.EmailType.EmailVerification, {
                email: user.email,
                payload: {
                    baseUrl,
                    email: user.email,
                    token: user.emailVerification.token,
                },
            });
        });
    };
    restdoneController.actions.resendVerification = restdoneController.normalizeAction({
        auth: ['bearer'],
        method: 'put',
        path: 'resend-verification',
        priority: -1,
        handler: function resendVerification(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = scope;
                if (user.emailVerified) {
                    throw createAppError_1.default(ALREADY_VERIFIED_RULE);
                }
                yield this.sendEmailVerification(scope, user);
                return undefined;
            });
        },
    }, 'resendVerification');
    restdoneController.actions.verifyEmail = restdoneController.normalizeAction({
        auth: ['oauth2-client-password'],
        method: 'post',
        path: 'verify-email/:token',
        handler: function verifyEmail(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params: { token } } = scope;
                const user = yield Model
                    .findOne({
                    'emailVerification.token': token,
                    'emailVerification.expires': {
                        $gt: new Date(),
                    },
                });
                if (!user) {
                    throw createAppError_1.default(WRONG_TOKEN_RULE);
                }
                user.emailVerified = true;
                user.emailVerification = undefined;
                yield user.save();
                return undefined;
            });
        },
    }, 'verifyEmail');
}
const plugin = {
    mongoose: mongooseFn,
    restdone: restdoneFn,
};
exports.default = plugin;
//# sourceMappingURL=emailVerification.restdone.plugin.js.map