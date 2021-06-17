"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const restdone_1 = __importDefault(require("restdone"));
const app_1 = __importDefault(require("app"));
const createAppError_1 = __importDefault(require("./createAppError"));
const { consts: { AUTH, RULES: { ALLOW_FOR_ADMIN_ONLY_RULE } } } = app_1.default;
const defaultAction = {
    enabled: true,
    auth: [AUTH.BEARER],
};
/**
 * @swagger
 *
 * components:
 *   securitySchemes:
 *     Bearer Token:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 *       description: You can obtain your token on /auth/login
 *     OauthSecurity:
 *       type: oauth2
 *       flows:
 *         password:
 *           refreshUrl: /oauth
 *           tokenUrl: /oauth
 *
 * tags:
 *  - name: Albums
 *    description: Operations available to Albums model
 *  - name: Chats
 *    description: Operations available to Chats model
 *  - name: Comments
 *    description: Operations available to Comments model
 *  - name: Feedbacks
 *    description: Operations available to Feedbacks model
 *  - name: Goals
 *    description: Operations available to Goals model
 *  - name: LiveStreams
 *    description: Operations available to LiveStreams model
 *  - name: Messages
 *    description: Operations available to Messages model
 *  - name: Meta
 *    description: Operations available to meta data
 *  - name: Notifications
 *    description: Operations available to Notifications model
 *  - name: OAuth
 *    description: Operations available to OAuth
 *  - name: Onboarding
 *    description: Operations available to Onboarding
 *  - name: Photos
 *    description: Operations available to Photos model
 *  - name: Reports
 *    description: Operations available to Reports model
 *  - name: Rewards
 *    description: Operations available to Rewards model
 *  - name: Sessions
 *    description: Operations available to Sessions model
 *  - name: Strikes
 *    description: Operations available to Strikes model
 *  - name: Subscribers
 *    description: Operations available to Subscribers
 *  - name: Upload
 *    description: Operations available to file uploading
 *  - name: Users
 *    description: Operations available to User model
 */
class BaseController extends restdone_1.default.Controller {
    constructor(options) {
        super(options || { actions: { default: defaultAction } });
    }
    static createAction(options) {
        return lodash_1.default.defaults(options, defaultAction);
    }
    static getName() {
        return this.name.charAt(0).toLowerCase() + this.name.replace('Controller', '').slice(1);
    }
    bind() {
        if (this.expandForAdmin) {
            const adminPaths = this.path.map((path) => `/admin${path}`);
            this.path.push(...adminPaths);
        }
        return super.bind();
    }
    requireAdmin(scope) {
        if (!scope.isAdminMode) {
            throw createAppError_1.default(ALLOW_FOR_ADMIN_ONLY_RULE);
        }
    }
    getUserStrict(scope) {
        const { user } = scope;
        if (!user) {
            throw new Error('No user');
        }
        return user;
    }
    requireUser(scope) {
        this.getUserStrict(scope);
    }
    createScope(controller, transport) {
        const result = super.createScope(controller, transport);
        result.isResourceOwner = function isResourceOwner(userId, otherUserId) {
            userId = userId.toString();
            otherUserId = otherUserId.toString();
            return userId === otherUserId;
        };
        result.overrideField = function overrideField(fieldName, value) {
            this.params[fieldName] = value;
            this.body[fieldName] = value;
        };
        if (transport.transportName === 'express') {
            const expressTransportData = result.transportData;
            result.getUser = function getUser() {
                const { user } = expressTransportData.req;
                return user && !user.clientId ? user : null;
            };
            result.setUser = function setUser() {
                // Do nothing, passport will inject user by access token in every request
            };
            result.getClient = function getClient() {
                const { user } = expressTransportData.req;
                return user && user.clientId ? user : null;
            };
            result.getLocale = function getLocale() {
                return expressTransportData.req.getLocale();
            };
            result.getReferrer = function getReferrer() {
                return expressTransportData.req.headers.referer || null;
            };
            result.getSocket = function getSocket() {
                return null;
            };
            // eslint-disable-next-line @typescript-eslint/naming-convention
            result._isAdminMode = function _isAdminMode() {
                // @ts-ignore
                return !!expressTransportData.req.adminMode;
            };
        }
        else if (transport.transportName === 'socket.io') {
            const socketIoTransportData = result.transportData;
            result.user = null;
            result.getUser = function getUser() {
                return socketIoTransportData.socket.handshake.user;
            };
            result.getClient = function getClient() {
                return socketIoTransportData.socket.handshake.client;
            };
            result.setUser = function setUser(user) {
                // TODO: update it, when user is updated
                socketIoTransportData.socket.handshake.user = user;
                return user;
            };
            result.getReferrer = function getReferrer() {
                return socketIoTransportData.socket.request.headers.referer;
            };
            result.getLocale = function getLocale() {
                // TODO: implement
                return null;
            };
            result.getSocket = function getSocket() {
                return socketIoTransportData.socket;
            };
            // eslint-disable-next-line @typescript-eslint/naming-convention
            result._isAdminMode = function _isAdminMode() {
                return false;
            };
        }
        else {
            throw new Error(`Unsupported transport: ${transport.transportName}`);
        }
        Object.defineProperties(result, {
            user: {
                get() {
                    return this.getUser();
                },
                set() {
                    return this.setUser();
                },
            },
            client: {
                get() {
                    return this.getClient();
                },
            },
            isAdminMode: {
                get() {
                    return this._isAdminMode();
                },
            },
            locale: {
                get() {
                    return this.getLocale();
                },
            },
            referrer: {
                get() {
                    return this.getReferrer();
                },
            },
            socket: {
                get() {
                    return this.getSocket();
                },
            },
        });
        return result;
    }
}
BaseController.AUTH = AUTH;
exports.default = BaseController;
//# sourceMappingURL=base.restdone.controller.js.map