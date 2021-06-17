"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const controldone_1 = __importDefault(require("controldone"));
const { ExpressTransport, SocketIoTransport } = controldone_1.default;
exports.default = (expressApp, app) => {
    const { consts: { AUTH }, apiControllers: Controllers, } = app;
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
    // @ts-ignore
    expressTransport.getAuth = function getAuth(options) {
        prepareAuth(options);
        const auths = [
            // TODO: Improve typing for oAuthdone
            expressApp.oAuthdone.authenticate(options.auth),
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
    const controldone = new controldone_1.default({
        transports: [expressTransport, socketIoTransport],
        // @ts-ignore
        log,
    });
    Controllers.forEach((ControllerClass) => {
        controldone.addController(ControllerClass, {
            transports: [expressTransport, socketIoTransport],
            log,
        });
    });
    app.registerProvider('controldone', controldone);
};
//# sourceMappingURL=0125-controldone.middleware.js.map