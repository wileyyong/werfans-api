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
const crypto_1 = __importDefault(require("crypto"));
const url_1 = require("url");
const bcrypt_1 = __importDefault(require("bcrypt"));
const lodash_1 = __importDefault(require("lodash"));
const http_status_node_1 = __importDefault(require("http-status-node"));
const validateSchema_1 = __importDefault(require("app/lib/validateSchema"));
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const fromCallback_1 = __importDefault(require("app/lib/helpers/fromCallback"));
const app_1 = __importDefault(require("app"));
const auth_consts_1 = __importDefault(require("./auth.consts"));
const auth_plugin_schema_1 = __importDefault(require("./schemas/auth-plugin.schema"));
const FacebookHelper_1 = __importDefault(require("./sn-helpers/FacebookHelper"));
const GoogleHelper_1 = __importDefault(require("./sn-helpers/GoogleHelper"));
const email_1 = require("../../../domains/email");
const { INTERNAL_SERVER_ERROR } = http_status_node_1.default;
const { AUTH_CHANGE_PASSWORD_SCHEMA, AUTH_FORGOT_PASSWORD_SCHEMA, } = auth_plugin_schema_1.default;
const { RULES: { ALREADY_LINKED_RULE, BAD_PASSWORD_RULE, INVALID_USERNAME_RULE, OTHER_ALREADY_LINKED_RULE, UNLINK_PRIMARY_ACCOUNT_RULE, UNSUPPORTED_SN_VALUE_RULE, WRONG_PASSWORD_RESET_TOKEN_RULE, }, } = auth_consts_1.default;
const LOCAL_PROVIDER = 'local';
const SALT_ROUNDS = 10;
const requiredForLocalProvider = function requiredForLocalProvider() {
    return this.provider === LOCAL_PROVIDER;
};
/**
 * @apiIgnore
 * @apiGroup User
 * @apiName LogoutUser
 * @api {post} /api/users/logout Logout User
 * @apiDescription Logs out the current user.
 * @apiPermission bearer
 *
 * @apiUse BearerAuthHeader
 * @apiUse EmptySuccess
 */
/**
 * @apiIgnore
 * @apiGroup User
 * @apiName ChangeUserPassword
 * @api {post} /api/users/:_id/change-password Change User Password
 * @apiDescription Changes user password. Only owner or admin can change password.
 *
 * @apiParam {String} password the current password of the user
 * @apiParam {String} newPassword
 *
 * @apiPermission bearer
 *
 * @apiUse BearerAuthHeader
 * @apiUse EmptySuccess
 */
/**
 * @apiIgnore
 * @apiGroup User
 * @apiName ForgotUserPassword
 * @api {post} /api/users/forgot Send Restoration Code
 * @apiDescription Initiates password restoration, sending reset code to email.
 * @apiPermission client
 * @apiParam {String} username email of a user, who restores password
 *
 * @apiUse ClientAuthParams
 * @apiUse EmptySuccess
 */
/**
 * @apiIgnore
 * @apiGroup User
 * @apiName ResetUserPassword
 * @api {post} /api/users/reset/:token Reset User Password
 * @apiDescription Resets user password.
 * @apiPermission client
 *
 * @apiParam {String} token restoration token, received in email
 * @apiParam {String} newPassword new password
 *
 * @apiUse ClientAuthParams
 * @apiUse AuthSuccess
 */
function mongooseFn(schema, options) {
    const { fields = {} } = options;
    schema.add({
        username: Object.assign({ type: String, unique: 'User with this username already exists', sparse: true, required: [
                requiredForLocalProvider,
                'Path `{PATH}` is required.',
            ], trim: true, lowercase: true }, fields.username),
        hashedPassword: Object.assign({ type: String, default: '' }, fields.hashedPassword),
        provider: Object.assign({ type: String, default: LOCAL_PROVIDER, required: true }, fields.provider),
        linkedAccounts: Object.assign({}, fields.linkedAccounts),
        resetPassword: Object.assign({ token: String, expires: Date }, fields.resetPassword),
    });
    schema.statics.logout = function logout(userId) {
        return app_1.default.modelProvider.RefreshToken.deleteMany({ user: userId });
    };
    schema.methods.authenticate = function authenticate(password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this;
            if (user.hashedPassword)
                return bcrypt_1.default.compare(password, user.hashedPassword);
            else
                return false;
        });
    };
    schema.statics.hashPassword = function hashPassword(password) {
        return __awaiter(this, void 0, void 0, function* () {
            return bcrypt_1.default.hash(password, SALT_ROUNDS);
        });
    };
}
function restdoneFn(restdoneController, options) {
    const { authenticate, profileFilter } = options;
    const { config, modelProvider: { User, }, } = app_1.default;
    function normalize(sn, query) {
        const prefix = `linkedAccounts.${sn}`;
        const result = {};
        lodash_1.default.forEach(query.linkedAccounts[sn], (value, key) => {
            result[`${prefix}.${key}`] = value;
        });
        return result;
    }
    const snHelpers = {};
    function getSnHelper(sn) {
        if (!config.isTest) {
            return snHelpers[sn];
        }
        else {
            return snHelpers.emulation;
        }
    }
    const { sns } = options;
    if (config.isTest) {
        snHelpers.emulation = {
            getProfile(authData) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!authData) {
                        throw INTERNAL_SERVER_ERROR.createError('No emulation data provider');
                    }
                    return {
                        id: authData.id,
                        email: authData.email,
                        name: authData.name,
                        firstName: authData.firstName,
                        lastName: authData.lastName,
                    };
                });
            },
            buildQuery(profile) {
                return { id: profile.id };
            },
            extract(profile) {
                return {
                    username: profile.email,
                    fullName: `${profile.firstName} ${profile.lastName}`,
                };
            },
        };
    }
    else if (sns) {
        if (sns.facebook) {
            snHelpers.facebook = new FacebookHelper_1.default(sns.facebook);
        }
        if (sns.google) {
            snHelpers.google = new GoogleHelper_1.default(sns.google);
        }
    }
    restdoneController.actions.snAuth = restdoneController.normalizeAction({
        auth: ['oauth2-client-password'],
        method: 'post',
        path: 'snAuth/:sn',
        handler: function snAuth(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params: { sn }, body: { auth, device_type: deviceType } } = scope;
                const snHelper = getSnHelper(sn);
                if (!snHelper) {
                    throw createAppError_1.default(UNSUPPORTED_SN_VALUE_RULE, sn);
                }
                const query = { linkedAccounts: {} };
                const profile = yield snHelper.getProfile(auth);
                query.linkedAccounts[sn] = snHelper.buildQuery(profile);
                let doc = yield User.findOne(normalize(sn, query));
                if (!doc) {
                    query.provider = sn;
                    let userData = snHelper.extract(profile);
                    if (lodash_1.default.isFunction(profileFilter)) {
                        userData = profileFilter.call(this, userData);
                    }
                    Object.assign(query, userData);
                    query.deviceType = deviceType;
                    doc = yield User.create(query);
                }
                else {
                    doc.set(`linkedAccounts.${sn}`, query.linkedAccounts[sn]);
                    doc.set('deviceType', deviceType);
                    yield doc.save();
                }
                if (lodash_1.default.isFunction(authenticate)) {
                    return authenticate.call(this, doc, scope);
                }
                else {
                    return undefined;
                }
            });
        },
    }, 'snAuth');
    restdoneController.actions.linkAccount = restdoneController.normalizeAction({
        method: 'put',
        path: ':_id/linked-accounts/:sn',
        handler: function linkAccount(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params, body: { auth } } = scope;
                const { sn } = params;
                delete params.sn;
                const query = { linkedAccounts: {} };
                const affectedDoc = yield this.locateModel(scope);
                const snHelper = getSnHelper(sn);
                if (!snHelper) {
                    throw createAppError_1.default(UNSUPPORTED_SN_VALUE_RULE, sn);
                }
                const profile = yield snHelper.getProfile(auth);
                query.linkedAccounts[sn] = snHelper.buildQuery(profile);
                const doc = yield User.findOne(normalize(sn, query));
                // check, if somebody else linked with this data
                if (doc) {
                    if (doc.id === affectedDoc.id) {
                        throw createAppError_1.default(ALREADY_LINKED_RULE);
                    }
                    else {
                        throw createAppError_1.default(OTHER_ALREADY_LINKED_RULE);
                    }
                }
                affectedDoc.set(`linkedAccounts.${sn}`, query.linkedAccounts[sn]);
                yield affectedDoc.save();
                return undefined;
            });
        },
    }, 'linkAccount');
    restdoneController.actions.unlinkAccount = restdoneController.normalizeAction({
        method: 'delete',
        path: ':_id/linked-accounts/:sn',
        handler: function linkAccount(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params } = scope;
                const { sn } = params;
                delete params.sn;
                const doc = yield this.locateModel(scope);
                const snHelper = getSnHelper(sn);
                if (!snHelper) {
                    throw createAppError_1.default(UNSUPPORTED_SN_VALUE_RULE, sn);
                }
                if (doc.provider === sn) {
                    throw createAppError_1.default(UNLINK_PRIMARY_ACCOUNT_RULE);
                }
                doc.set(`linkedAccounts.${sn}`, undefined);
                yield doc.save();
                return undefined;
            });
        },
    }, 'unlinkAccount');
    restdoneController.actions.logout = restdoneController.normalizeAction({
        auth: ['bearer'],
        method: 'post',
        path: 'logout',
        handler: function logout(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { user } = scope;
                if (!user) {
                    throw INTERNAL_SERVER_ERROR.createError('No user in context');
                }
                yield User.logout(user._id);
                return undefined;
            });
        },
    }, 'logout');
    restdoneController.actions.changePassword = restdoneController.normalizeAction({
        auth: ['bearer'],
        method: 'post',
        path: ':_id/change-password',
        handler: function changePassword(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { body, user: currentUser } = scope;
                if (!currentUser) {
                    throw INTERNAL_SERVER_ERROR.createError('No user in context');
                }
                const { username } = currentUser;
                const validatedBody = yield validateSchema_1.default(body, AUTH_CHANGE_PASSWORD_SCHEMA);
                const { password, newPassword } = validatedBody;
                const user = (yield User.findOne({ username }));
                if (!(yield user.authenticate(password))) {
                    throw createAppError_1.default(BAD_PASSWORD_RULE);
                }
                user.hashedPassword = yield User.hashPassword(newPassword);
                yield user.save();
                return undefined;
            });
        },
    }, 'changePassword');
    restdoneController.actions.forgot = restdoneController.normalizeAction({
        auth: ['oauth2-client-password'],
        method: 'post',
        path: 'forgot',
        handler: function forgot(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { origin } = new url_1.URL(scope.referrer || '');
                const baseUrl = `${origin}/${config.urls.resetPassword}`;
                const { body } = scope;
                const validatedBody = yield validateSchema_1.default(body, AUTH_FORGOT_PASSWORD_SCHEMA);
                const user = yield User.findOne({ username: validatedBody.username.toLowerCase() });
                if (!user) {
                    throw createAppError_1.default(INVALID_USERNAME_RULE);
                }
                const buffer = yield fromCallback_1.default((callback) => {
                    crypto_1.default.randomBytes(20, callback);
                });
                if (buffer) {
                    user.resetPassword = {
                        token: buffer.toString('hex'),
                        expires: new Date(Date.now() + (1000 * config.security.forgotPasswordTokenLife)),
                    };
                    yield user.save();
                    yield app_1.default.emailService.sendEmail(email_1.EmailType.ForgotPassword, {
                        email: user.username,
                        payload: {
                            baseUrl,
                            token: user.resetPassword.token,
                            username: user.username,
                        },
                    });
                }
                return undefined;
            });
        },
    }, 'forgot');
    restdoneController.actions.reset = restdoneController.normalizeAction({
        auth: ['oauth2-client-password'],
        method: 'post',
        path: 'reset/:token',
        handler: function reset(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params: { token }, body: { newPassword } } = scope;
                if (!newPassword) {
                    throw createAppError_1.default(WRONG_PASSWORD_RESET_TOKEN_RULE);
                }
                const user = yield User.findOne({
                    'resetPassword.token': token,
                    'resetPassword.expires': {
                        $gt: new Date(),
                    },
                });
                if (!user) {
                    throw createAppError_1.default(WRONG_PASSWORD_RESET_TOKEN_RULE);
                }
                user.hashedPassword = yield User.hashPassword(newPassword);
                user.resetPassword = undefined;
                yield user.save();
                yield app_1.default.emailService.sendEmail(email_1.EmailType.ResetPassword, {
                    email: user.username,
                    payload: {
                        username: user.username,
                    },
                });
                return authenticate(user, scope);
            });
        },
    }, 'reset');
}
const plugin = {
    mongoose: mongooseFn,
    restdone: restdoneFn,
};
exports.default = plugin;
//# sourceMappingURL=auth.restdone.plugin.js.map