"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const restdone_1 = __importDefault(require("restdone"));
const createAppError_1 = __importDefault(require("../lib/createAppError"));
const { ExpressTransport, SocketIoTransport } = restdone_1.default;
exports.default = (expressApp, app) => {
    const { config: { banningStrategy: { endpointWhitelist } }, consts: { AUTH, RULES: { FORBIDDEN_FOR_BANNED_USER } }, restControllers: Controllers, } = app;
    const log = app.createLog(module);
    const expressTransport = new ExpressTransport({ app: expressApp });
    function prepareAuth(options) {
        if (options.auth) {
            // make options.auth to be an array
            if (!Array.isArray(options.auth)) {
                options.auth = [options.auth];
            }
            else {
                options.auth = lodash_1.default.uniq(options.auth);
            }
            const auth = options.auth;
            // always add basic auth to client auth
            if (auth.includes(AUTH.CLIENT) && !auth.includes(AUTH.BASIC)) {
                auth.push(AUTH.BASIC);
            }
        }
    }
    function isBannedUser(req) {
        // @ts-ignore
        const { user } = req;
        return user && !user.clientId && user.suspendedAt;
    }
    const isWhitelisted = (req) => endpointWhitelist.includes(req.path);
    // @ts-ignore
    expressTransport.getAuth = function getAuth(options) {
        prepareAuth(options);
        const auths = [
            // TODO: Improve typing for oAuthdone
            expressApp.oAuthdone.authenticate(options.auth),
            (req, res, next) => {
                if (isBannedUser(req) && !isWhitelisted(req)) {
                    next(createAppError_1.default(FORBIDDEN_FOR_BANNED_USER));
                }
                else {
                    next();
                }
            },
            (req, res, next) => {
                req.adminMode = false;
                const matchingPath = req.url.match(/^\/admin/);
                if (!matchingPath) {
                    return next();
                }
                const { user } = req;
                if (!user
                    || user.clientId
                    || !user.isAdmin
                    || !user.isAdmin()) {
                    return res
                        .status(403)
                        .send({
                        message: 'Allowable for admins only',
                    });
                }
                req.adminMode = true;
                return next();
            },
            (req, res, next) => {
                if (!req.isAuthenticated()) {
                    // options
                    return res.status(401).send({
                        message: 'User is not logged in',
                    });
                }
                return next();
            },
        ];
        return options.auth
            ? auths
            : (req, res, callback) => {
                callback();
            };
    };
    const socketIoTransport = new SocketIoTransport({
        sio: app.sio,
    });
    const restdone = new restdone_1.default({
        transports: [expressTransport, socketIoTransport],
        // @ts-ignore
        log,
    });
    Controllers.forEach((ControllerClass) => {
        restdone.addController(ControllerClass);
    });
    app.registerProvider('restdone', restdone);
};
//# sourceMappingURL=0130-restdone.middleware.js.map