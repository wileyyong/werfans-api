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
const app_1 = __importDefault(require("app"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { modelProvider: { User, }, } = app_1.default;
const MASK_FIELDS = [
    '_id',
];
describe('User subscribersStats', () => {
    const user = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1, { username: 'user' });
    const otherUser = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2, { username: 'otherUser' });
    const targetUser = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 3, { username: 'targetUser' });
    const aloneUser = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 4, { username: 'aloneUser' });
    const expiredUser = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 5, { username: 'expiredUser' });
    Object.assign(user, {
        showSubscribersCounter: false,
    });
    specHelper_1.default.withUser({
        data: user,
        key: 'user',
    });
    specHelper_1.default.withUser({
        data: otherUser,
        key: 'otherUser',
    });
    specHelper_1.default.withUser({
        data: targetUser,
        key: 'targetUser',
    });
    specHelper_1.default.withUser({
        data: expiredUser,
        key: 'expiredUser',
    });
    specHelper_1.default.withUser({
        data: aloneUser,
        key: 'aloneUser',
    });
    before(function () {
        return __awaiter(this, void 0, void 0, function* () {
            yield User.updateOne({ _id: this.targetUser._id }, {
                $push: {
                    subscribers: {
                        $each: [this.user._id, this.otherUser._id],
                    },
                },
                $set: { subscribersCounter: 2 },
            });
            yield User.updateOne({ _id: this.user._id }, {
                $push: {
                    subscriptions: {
                        active: true,
                        targetUser: this.targetUser._id,
                    },
                },
            });
            yield User.updateOne({ _id: this.otherUser._id }, {
                $push: {
                    subscriptions: {
                        active: true,
                        targetUser: this.targetUser._id,
                    },
                },
            });
            yield User.updateOne({ _id: this.expiredUser._id }, {
                $push: {
                    subscriptions: {
                        active: false,
                        targetUser: this.targetUser._id,
                    },
                },
            });
        });
    });
    describe('by owner', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.targetUser._id}?fields=subscribersStats`, { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } });
        }, 200, { mask: MASK_FIELDS });
    });
    describe('in public one', () => {
        describe('with enabled showSubscribersCounter', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.targetUser._id}/public?fields=subscribersStats`, { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } });
            }, 200, { mask: MASK_FIELDS });
        });
        describe('with disabled showSubscribersCounter', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/public?fields=subscribersStats`, { headers: { Authorization: `Bearer ${this.aloneUser.auth.access_token}` } });
            }, 200, { mask: MASK_FIELDS });
        });
    });
    describe('in public list', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/public?fields=subscribersStats`, { headers: { Authorization: `Bearer ${this.targetUser.auth.access_token}` } });
        }, 200, { mask: MASK_FIELDS });
    });
});
//# sourceMappingURL=user-subscribersStats.spec.js.map