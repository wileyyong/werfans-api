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
const mongoose_1 = require("mongoose");
const banContent_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/banContent.restdone.plugin"));
const strike_1 = require("../domains/strike");
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     ChatMessageResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         chat:
 *           type: string
 *         author:
 *           type: string
 *         body:
 *           type: string
 *         unread:
 *           type: array
 *           items:
 *             type: string
 *             description: _ids of unread users
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */
const modelName = 'Message';
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        chat: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Chat',
            required: true,
        },
        author: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        unread: [{
                type: mongoose_1.Schema.Types.ObjectId,
                ref: 'User',
            }],
        banningReasonType: {
            type: String,
            enum: strike_1.StrikeTypeValues,
        },
        banningReasonDescription: {
            type: String,
        },
    }, {
        timestamps: true,
    });
    schema.pre('save', function preSave(next) {
        this.wasNew = this.isNew;
        next();
    });
    schema.post('save', (doc) => __awaiter(void 0, void 0, void 0, function* () {
        if (doc.wasNew) {
            const { modelProvider: { Chat } } = app_1.default;
            yield Chat.incMessageCounter(doc.chat, 1);
        }
    }));
    schema.post('remove', (doc) => __awaiter(void 0, void 0, void 0, function* () {
        const { modelProvider: { Chat } } = app_1.default;
        yield Chat.incMessageCounter(doc.chat, -1);
    }));
    schema.statics.removeFromUnread = function removeFromUnread(userId) {
        return this.update({}, { $pull: { unread: userId } }, { multi: true });
    };
    schema.statics.removeDependencies = function removeDependencies(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this.findOne({ _id: userId });
            return user.removeDependencies();
        });
    };
    schema.plugin(banContent_restdone_plugin_1.default.mongoose);
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=message.model.js.map