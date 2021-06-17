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
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("app"));
const chat_1 = require("../domains/chat");
const modelName = 'Chat';
/**
 * @swagger
 * components:
 *   schemas:
 *     ChatResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         chatType:
 *           type: string
 *           enum:
 *             - private
 *             - liveStream
 *         metadata:
 *           type: object
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         messagesCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *     ChatResponseWithUnread:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         chatType:
 *           type: string
 *           enum:
 *             - private
 *             - liveStream
 *         metadata:
 *           type: object
 *         participants:
 *           type: array
 *           items:
 *             type: string
 *         messagesCounter:
 *           type: integer
 *         unreadMessagesCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */
exports.default = (mongoose) => {
    const schema = new mongoose.Schema({
        chatType: {
            type: String,
            enum: chat_1.ChatTypeValues,
            required: true,
        },
        metadata: {
            type: mongoose_1.Schema.Types.Mixed,
        },
        name: {
            type: String,
        },
        participants: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            }],
        messagesCounter: {
            type: Number,
            default: 0,
        },
    }, {
        timestamps: true,
    });
    schema.post('remove', (doc, next) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            yield doc.removeDependencies();
            next();
        }
        catch (err) {
            next(err);
        }
    }));
    schema.statics.createLiveStream = function createLiveStream(liveStreamId, ownerId) {
        const createObj = {
            chatType: chat_1.ChatType.LiveStream,
            participants: [ownerId],
            metadata: { liveStream: liveStreamId },
        };
        return this.create(createObj);
    };
    schema.statics.incMessageCounter = function incMessageCounter(id, value) {
        return this
            .updateOne({ _id: id }, { $inc: { messagesCounter: value } });
    };
    schema.statics.removeDependencies = function removeDependencies(chatId) {
        return __awaiter(this, void 0, void 0, function* () {
            const chat = yield this.findOne({ _id: chatId });
            return chat.removeDependencies();
        });
    };
    schema.statics.countUnreadMessages = function countUnreadMessages(chats, user) {
        const { modelProvider: { Message } } = app_1.default;
        return Promise.all(chats.map((chat) => __awaiter(this, void 0, void 0, function* () {
            // Count all the unread messages, except those that are still uploading
            chat.unreadMessagesCounter = yield Message.countDocuments({
                chat: chat._id,
                unread: user._id || user,
                videoUrls: { $nin: ['uploading.com'] },
            });
            return chat;
        })));
    };
    schema.methods.removeDependencies = function removeDependencies() {
        const { modelProvider: { Message } } = app_1.default;
        return Message.remove({ chat: this.id });
    };
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=chat.model.js.map