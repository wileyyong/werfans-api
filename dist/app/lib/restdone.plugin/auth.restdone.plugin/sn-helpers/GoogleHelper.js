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
const lodash_1 = __importDefault(require("lodash"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const GOOGLE_URL = 'https://www.googleapis.com/oauth2/v3';
const FIELDS = ['sub', 'name'];
class GoogleHelper {
    constructor(options) {
        this.options = options;
    }
    getProfile(authData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!authData.idToken) {
                throw new Error('Missing required fields');
            }
            const res = yield node_fetch_1.default(`${GOOGLE_URL}/tokeninfo?id_token=${authData.idToken}`);
            if (res.status < 200 || res.status > 299) {
                throw new Error('wrong response from Google');
            }
            const json = yield res.json();
            if (!lodash_1.default.includes(this.options.audiences, json.aud)) {
                throw new Error('wrong credentials');
            }
            if (1000 * json.exp < Date.now()) {
                throw new Error('token expired');
            }
            const hasMissedFields = lodash_1.default.find(FIELDS, (fieldName) => !json[fieldName]);
            if (hasMissedFields) {
                throw new Error('Missing required fields from Google');
            }
            return json;
        });
    }
    buildQuery(profile) {
        return { id: profile.sub };
    }
    extract(profile) {
        return {
            username: profile.email,
            fullName: `${profile.given_name} ${profile.family_name}`,
        };
    }
}
exports.default = GoogleHelper;
module.exports = GoogleHelper;
//# sourceMappingURL=GoogleHelper.js.map