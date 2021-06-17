"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("app"));
const email_1 = require("../../domains/email");
const { config: { app: { title } } } = app_1.default;
const email = {
    name: email_1.EmailType.Notification,
    templateName: 'notification',
    buildData({ username, notificationType, notificationBody, notificationMetadata, }) {
        return {
            appName: title,
            name: `${username}`,
            notificationType,
            notificationBody,
            notificationMetadataStr: JSON.stringify(notificationMetadata, undefined, 2),
        };
    },
    buildSubject() {
        return 'New notification';
    },
};
exports.default = email;
//# sourceMappingURL=notification.email.js.map