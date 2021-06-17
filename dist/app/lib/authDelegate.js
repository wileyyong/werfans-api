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
const http_status_node_1 = __importDefault(require("http-status-node"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app_1 = __importDefault(require("app"));
const fromCallback_1 = __importDefault(require("./helpers/fromCallback"));
const { config, modelProvider: { User, Client, RefreshToken } } = app_1.default;
class AuthDelegate {
    constructor() {
        this.tokenLife = config.security.tokenLife;
    }
    createAuthorizationCode() {
        return __awaiter(this, void 0, void 0, function* () {
            throw http_status_node_1.default.NOT_ACCEPTABLE.createError();
        });
    }
    findAuthorizationCode() {
        return __awaiter(this, void 0, void 0, function* () {
            throw http_status_node_1.default.NOT_ACCEPTABLE.createError();
        });
    }
    findUser({ login, password }) {
        return __awaiter(this, void 0, void 0, function* () {
            if (login && password) {
                const user = yield User.findOne({
                    username: login.toLowerCase(),
                });
                if (!user || !(yield user.authenticate(password))) {
                    return null;
                }
                return user;
            }
            else {
                throw new Error('Wrong context!');
            }
        });
    }
    findUserByToken({ accessToken, refreshToken }) {
        return __awaiter(this, void 0, void 0, function* () {
            let token = null;
            if (accessToken) {
                const accessTokenPayload = (yield fromCallback_1.default((callback) => {
                    jsonwebtoken_1.default.verify(accessToken, config.security.tokenSecret, callback);
                }));
                if (!accessTokenPayload) {
                    throw new Error('Token expired');
                }
                token = accessTokenPayload;
            }
            else if (refreshToken) {
                token = yield RefreshToken.findOne({ token: refreshToken });
            }
            else {
                throw new Error('Wrong context!');
            }
            if (token) {
                const user = yield User.findOne({ _id: token.user });
                if (!user) {
                    throw new Error('Unknown user');
                }
                const info = { scope: token.scopes };
                return { obj: user, info };
            }
            else {
                return { obj: false };
            }
        });
    }
    findClient({ clientId, clientSecret }) {
        return __awaiter(this, void 0, void 0, function* () {
            const client = yield Client.findOne({ clientId });
            if (client && (clientSecret === false
                || client.clientSecret === clientSecret)) {
                return client;
            }
            else {
                return false;
            }
        });
    }
    cleanUpTokens({ client, user, authorizationCode, }) {
        return __awaiter(this, void 0, void 0, function* () {
            const { _id: clientId } = client || {};
            if (!clientId) {
                throw new Error('Client ID unspecified');
            }
            const userId = user ? user._id : authorizationCode.userId;
            const query = { user: userId, client: clientId };
            yield Promise.all([
                RefreshToken.deleteMany(query),
            ]);
        });
    }
    createAccessToken(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorizationCode, client, } = params;
            let { user } = params;
            if (!user) {
                user = yield User
                    .findOne({ _id: authorizationCode.userId });
            }
            if (!user) {
                throw new Error('Unknown user');
            }
            params.user = user;
            const payload = {
                user: user._id,
                client: client.id,
            };
            const result = yield fromCallback_1.default((callback) => (jsonwebtoken_1.default.sign(payload, config.security.tokenSecret, { expiresIn: config.security.tokenLife }, callback)));
            return result;
        });
    }
    createRefreshToken(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorizationCode, client } = params;
            let { user } = params;
            if (!user) {
                user = yield User.findOne({ _id: authorizationCode.userId });
            }
            if (!user) {
                throw new Error('Unknown user');
            }
            const refreshToken = {
                token: crypto_1.default.randomBytes(32).toString('base64'),
                client: client._id,
                user: user._id,
            };
            const result = yield RefreshToken.create(refreshToken);
            return result.token;
        });
    }
    getTokenInfo(params) {
        return __awaiter(this, void 0, void 0, function* () {
            const { authorizationCode } = params;
            let { user } = params;
            if (!user) {
                user = yield User.findOne({ _id: authorizationCode.userId });
            }
            if (!user) {
                throw new Error('Unknown user');
            }
            return { expires_in: `${this.tokenLife}` };
        });
    }
}
exports.default = AuthDelegate;
//# sourceMappingURL=authDelegate.js.map