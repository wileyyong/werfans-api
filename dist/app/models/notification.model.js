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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notification_1 = require("../domains/notification");
const modelName = 'Notification';
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     NotificationModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         notificationType:
 *           type: string
 *           enum:
 *             - Testing
 *             - LiveStreamStarted
 *             - PrivateMessageReceived
 *             - VideoUploaded
 *         readable:
 *           type: boolean
 *         body:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
module.exports = (mongoose) => {
    const schema = new mongoose_1.Schema({
        notificationType: {
            type: String,
            enum: notification_1.NotificationTypeValues,
            required: true,
        },
        readable: {
            type: Boolean,
            default: true,
        },
        recipients: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }],
        unread: [{
                type: mongoose.Schema.Types.ObjectId,
                ref: 'User',
            }],
        body: {
            type: String,
            required: true,
        },
        metadata: {},
    }, {
        timestamps: true,
    });
    schema.statics.removeFromUnread = function removeFromUnread(userId) {
        return this.updateMany({}, { $pull: { unread: userId } }, { multi: true });
    };
    schema.methods.removeDependencies = function removeDependencies() {
        return __awaiter(this, void 0, void 0, function* () {
            // put logic here
        });
    };
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=notification.model.js.map