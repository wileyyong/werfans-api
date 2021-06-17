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
const FB_URL = 'https://graph.facebook.com';
const FIELDS = ['id'];
class FacebookHelper {
    constructor(options) {
        this.options = options;
    }
    getProfile(authData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!authData.accessToken) {
                throw new Error('Missing required fields');
            }
            const fieldsToFetch = this.options.fieldsToFetch || 'name';
            const res = yield node_fetch_1.default(`${FB_URL}/me?fields=id,${fieldsToFetch},email&access_token=${authData.accessToken}`);
            if (res.status < 200 || res.status > 299) {
                throw new Error('wrong response from FB');
            }
            const json = yield res.json();
            const hasMissedFields = lodash_1.default.find(FIELDS, (fieldName) => !json[fieldName]);
            if (hasMissedFields) {
                throw new Error('Missing required fields from FB');
            }
            return json;
        });
    }
    buildQuery(profile) {
        return { id: profile.id };
    }
    extract(profile) {
        return {
            fullName: `${profile.first_name} ${profile.last_name}`,
            username: profile.email,
        };
    }
}
exports.default = FacebookHelper;
//# sourceMappingURL=FacebookHelper.js.map