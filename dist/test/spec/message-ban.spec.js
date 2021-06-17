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
const chai_1 = require("chai");
const app_1 = __importDefault(require("app"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const strike_1 = require("../../app/domains/strike");
const { consts: { events, }, modelProvider: { Message, Strike, }, } = app_1.default;
const withBannedMessage = (shouldBan = false) => {
    const chatData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.CHAT, 1);
    const bannedMessageData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.MESSAGE, 1);
    before('open chat by user', function () {
        this.chat = Object.assign(chatData, { user: this.user._id, typeParam: this.otherUser._id });
        return specHelper_1.default.openChat(this.userSocket, this.chat);
    });
    after('remove chat', function () {
        return specHelper_1.default.removeChat(this.chat);
    });
    before('create message', function () {
        this.bannedMessage = bannedMessageData;
        return specHelper_1.default.createMessage(this.userSocket, this.chat._id, this.bannedMessage);
    });
    if (shouldBan) {
        before(function () {
            return specHelper_1.default.banMessage(this.adminUser, this.bannedMessage);
        });
    }
};
const MASKING_FIELDS = ['_id', 'author', 'chat', 'unread[0]', 'createdAt', 'updatedAt'];
describe('Message Ban', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUserSocket({
        key: 'userSocket',
        seed: 1,
        userKey: 'user',
    });
    specHelper_1.default.withUserSocket({
        key: 'otherUserSocket',
        seed: 2,
        userKey: 'otherUser',
    });
    describe('Ban message', () => {
        describe('by regular user', () => {
            withBannedMessage();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/messages/${this.bannedMessage._id}/ban`, {
                    banningReasonType: strike_1.StrikeType.Spam,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 403);
        });
        describe('by admin', () => {
            withBannedMessage();
            specHelper_1.default.checkMoleculerEventEmit(events.strikes.created, true, {
                mask: ['_id', 'targetUser'],
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseAdminUrl}/messages/${this.bannedMessage._id}/ban`, {
                    banningReasonType: strike_1.StrikeType.Spam,
                }, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 204);
            it('should set banningReasonType', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const doc = yield Message.findById(this.bannedMessage._id).lean();
                    chai_1.expect(doc.banningReasonType).to.be.equal(strike_1.StrikeType.Spam);
                });
            });
            it('should create a strike', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const strike = yield Strike.findOne({ ref: this.bannedMessage._id }).lean();
                    chai_1.expect(strike.refModel).to.be.equal(strike_1.StrikeTargetModel.Message);
                    return chai_1.expect(specHelper_1.default.maskPaths(strike, [
                        '_id',
                        'creator',
                        'targetUser',
                        'ref',
                        'createdAt',
                        'updatedAt',
                    ])).matchSnapshot(this);
                });
            });
        });
    });
    describe('Unban message', () => {
        withBannedMessage(true);
        before(function () {
            return specHelper_1.default.unbanMessage(this.bannedMessage);
        });
        it('should reset banningReasonType', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const messageDoc = yield Message.findById(this.bannedMessage._id).lean();
                return chai_1.expect(messageDoc.banningReasonType).to.be.undefined;
            });
        });
    });
    describe('Actions with bannedMessage', () => {
        describe('get one', () => {
            describe('with not owner user', () => {
                withBannedMessage(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/chats/${this.chat._id}/messages/${this.bannedMessage._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                        },
                    });
                }, 404);
            });
            describe('with owner user', () => {
                withBannedMessage(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/chats/${this.chat._id}/messages/${this.bannedMessage._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.user.auth.access_token}`,
                        },
                    });
                }, 200);
            });
            describe('with admin user', () => {
                withBannedMessage(true);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/admin/messages/${this.bannedMessage._id}`, {
                        headers: {
                            Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                        },
                    });
                }, 200);
            });
        });
        describe('get list', () => {
            withBannedMessage(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/chats/${this.chat._id}/messages`, {
                    headers: {
                        Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                    },
                });
            }, 200, {
                description: 'should not contain banned item',
                mask: ['_id', 'createdAt', 'updatedAt'],
            });
        });
    });
    describe('Actions with unbannedMessage', () => {
        describe('get one', () => {
            withBannedMessage(true);
            before(function () {
                return specHelper_1.default.unbanMessage(this.bannedMessage);
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/chats/${this.chat._id}/messages/${this.bannedMessage._id}`, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 200);
        });
        describe('get list', () => {
            withBannedMessage(true);
            before(function () {
                return specHelper_1.default.unbanMessage(this.bannedMessage);
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/chats/${this.chat._id}/messages`, {
                    headers: {
                        Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                    },
                });
            }, 200, {
                description: 'should contain banned item',
                mask: MASKING_FIELDS,
            });
        });
    });
});
//# sourceMappingURL=message-ban.spec.js.map