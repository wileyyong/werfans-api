"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const notification_1 = require("../domains/notification");
const modelName = 'SystemNotification';
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     SystemNotificationModel:
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
 *         author:
 *           type: string
 *         sentAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     SystemNotificationModelList:
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
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         sentAt:
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
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
        },
        sentAt: {
            type: Date,
            default: null,
        },
    }, {
        timestamps: true,
    });
    schema.pre('save', function preSave(next) {
        if (this.isNew) {
            this.sentAt = new Date();
        }
        next();
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=systemNotification.model.js.map