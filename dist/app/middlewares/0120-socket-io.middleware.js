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
const http_1 = __importDefault(require("http"));
const socket_io_1 = __importDefault(require("socket.io"));
const socket_io_redis_1 = __importDefault(require("socket.io-redis"));
exports.default = (expressApp, app) => {
    const log = app.createLog(module);
    const server = http_1.default.createServer(expressApp);
    const sio = socket_io_1.default(server);
    const { config } = app;
    app.registerProvider('httpServer', server);
    app.registerProvider('sio', sio);
    sio.adapter(socket_io_redis_1.default(config.redis.url));
    const { authDelegate } = expressApp.oAuthdone;
    sio.use((socket, next) => __awaiter(void 0, void 0, void 0, function* () {
        let clientData;
        let token;
        const auth = socket.request.headers.authorization || socket.request._query.authorization;
        if (auth) {
            const parts = auth.split(' ');
            let value = parts[1];
            if (value) {
                if (parts[0].toLowerCase() === 'basic') {
                    // credentials
                    value = Buffer.from(value, 'base64').toString();
                    value = value.match(/^([^:]*):(.*)$/);
                    if (value) {
                        clientData = {
                            clientId: value[1],
                            clientSecret: value[2],
                        };
                    }
                }
                else if (parts[0].toLowerCase() === 'bearer') {
                    token = value;
                }
            }
        }
        try {
            const handshake = socket.handshake;
            if (token) {
                const user = yield authDelegate.findUserByToken({ accessToken: token });
                if (!(!user || !user.obj)) {
                    handshake.user = user.obj;
                    socket.join('global-notifications');
                    socket.join(`user-notifications-#${handshake.user.id}`);
                    next();
                }
                else {
                    next(new Error('Wrong credentials'));
                }
            }
            else if (clientData) {
                const client = yield authDelegate.findClient(clientData);
                if (client) {
                    handshake.client = client;
                    next();
                }
                else {
                    next(new Error('Wrong client data'));
                }
            }
            else {
                const err = new Error('No auth data available');
                log.error(err);
                next(err);
            }
        }
        catch (err) {
            next(err);
        }
    }));
    sio.on('connection', (socket) => {
        log.info('connected');
        socket.on('error', (err) => {
            log.error('Error happened');
            log.error(err);
        });
    });
};
//# sourceMappingURL=0120-socket-io.middleware.js.map