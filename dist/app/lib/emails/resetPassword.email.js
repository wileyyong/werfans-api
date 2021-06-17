"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("app"));
const email_1 = require("../../domains/email");
const { config: { app: { title } } } = app_1.default;
const email = {
    name: email_1.EmailType.ResetPassword,
    templateName: 'reset',
    buildData(payload) {
        return {
            appName: title,
            name: `${payload.username}`,
        };
    },
    buildSubject() {
        return 'Your password has been changed';
    },
};
exports.default = email;
//# sourceMappingURL=resetPassword.email.js.map