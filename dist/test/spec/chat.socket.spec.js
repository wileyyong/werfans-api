"use strict";
/**
 * Created by mk on 08/07/16.
 */
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const chai_1 = require("chai");
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const chat_1 = require("../../app/domains/chat");
const CHAT_MASKED_FIELDS = [
    '_id',
    'participants',
    'createdAt',
    'updatedAt',
];
const withUsers = () => {
    specHelper_1.default.withUserSocket({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
        key: 'userSocket',
        userKey: 'user',
    });
    specHelper_1.default.withUserSocket({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
        key: 'otherUserSocket',
        userKey: 'otherUser',
    });
};
describe('Chat Socket', () => {
    describe(`type ${chat_1.ChatType.Private}`, () => {
        describe('Remove not existing chat', () => {
            withUsers();
            specHelper_1.default.checkSocketResponse('userSocket', function () {
                return {
                    route: 'delete:/chats/:chatType/with/:typeParam',
                    params: {
                        chatType: chat_1.ChatType.Private,
                        user: this.user._id,
                        typeParam: this.otherUser._id,
                    },
                };
            }, 404);
        });
        describe('Open chat 1st time by user', () => {
            withUsers();
            specHelper_1.default.checkSocketResponse('userSocket', function () {
                return {
                    route: 'put:/chats/:chatType/with/:typeParam',
                    params: {
                        chatType: chat_1.ChatType.Private,
                        user: this.user._id,
                        typeParam: this.otherUser._id,
                    },
                };
            }, 200, {
                makeSnapShot: {
                    mask: CHAT_MASKED_FIELDS,
                },
            });
            after(function () {
                return specHelper_1.default.removeChat(this.response.body);
            });
        });
        describe('Open chat 2nd time by user', () => {
            withUsers();
            specHelper_1.default.withChat();
            specHelper_1.default.checkSocketResponse('userSocket', function () {
                return {
                    route: 'put:/chats/:chatType/with/:typeParam',
                    params: {
                        chatType: chat_1.ChatType.Private,
                        user: this.user._id,
                        typeParam: this.otherUser._id,
                    },
                };
            }, 200, {
                makeSnapShot: {
                    mask: CHAT_MASKED_FIELDS,
                },
            });
            it('_id should be the same _id', function () {
                return chai_1.expect(this.response.body._id).to.be.equal(this.chat._id);
            });
        });
        describe('Open chat by otherUser', () => {
            withUsers();
            specHelper_1.default.withChat();
            specHelper_1.default.checkSocketResponse('otherUserSocket', function () {
                return {
                    route: 'put:/chats/:chatType/with/:typeParam',
                    params: {
                        chatType: chat_1.ChatType.Private,
                        user: this.otherUser._id,
                        typeParam: this.user._id,
                    },
                };
            }, 200, {
                makeSnapShot: {
                    mask: CHAT_MASKED_FIELDS,
                },
            });
            it('_id should be the same _id', function () {
                return chai_1.expect(this.response.body._id).to.be.equal(this.chat._id);
            });
        });
        describe('Get chats', () => {
            withUsers();
            specHelper_1.default.withChat();
            specHelper_1.default.checkSocketResponse('userSocket', () => ({
                route: 'get:/chats',
                params: { user: 'me' },
            }), 200, {
                makeSnapShot: {
                    mask: CHAT_MASKED_FIELDS,
                },
            });
            it('_id should contain the same _id', function () {
                return chai_1.expect(this.response.body[0]._id).to.be.equal(this.chat._id);
            });
        });
        describe('Get chats count', () => {
            withUsers();
            specHelper_1.default.withChat();
            specHelper_1.default.checkSocketResponse('userSocket', () => ({
                route: 'get:/chats/count',
                params: { user: 'me' },
            }), 200, {
                makeSnapShot: {
                    mask: CHAT_MASKED_FIELDS,
                },
            });
        });
        describe('Remove chat', () => {
            withUsers();
            specHelper_1.default.withChat();
            specHelper_1.default.checkSocketResponse('userSocket', function () {
                return {
                    route: 'delete:/chats/:chatType/with/:typeParam',
                    params: {
                        chatType: chat_1.ChatType.Private,
                        user: this.user._id,
                        typeParam: this.otherUser._id,
                    },
                };
            }, 204);
        });
    });
    describe(`type ${chat_1.ChatType.LiveStream}`, () => {
        const chatType = chat_1.ChatType.LiveStream;
        describe('chat does not exist', () => {
            const liveStreamId = new mongoose_1.Types.ObjectId();
            withUsers();
            specHelper_1.default.checkSocketResponse('userSocket', function () {
                return {
                    route: 'put:/chats/:chatType/with/:typeParam',
                    params: {
                        chatType,
                        user: this.user._id,
                        typeParam: liveStreamId,
                    },
                };
            }, 200, {
                makeSnapShot: {
                    description: 'should be null',
                },
            });
        });
        describe('chat exists', () => {
            withUsers();
            specHelper_1.default.withLiveStream();
            specHelper_1.default.checkSocketResponse('userSocket', function () {
                return {
                    route: 'put:/chats/:chatType/with/:typeParam',
                    params: {
                        chatType,
                        user: this.user._id,
                        typeParam: this.liveStream._id,
                    },
                };
            }, 200, {
                makeSnapShot: {
                    mask: [...CHAT_MASKED_FIELDS, 'metadata.liveStream'],
                },
            });
            it('should include user in participants', function () {
                return chai_1.expect(this.response.body.participants).to.include(this.user._id);
            });
        });
    });
});
//# sourceMappingURL=chat.socket.spec.js.map