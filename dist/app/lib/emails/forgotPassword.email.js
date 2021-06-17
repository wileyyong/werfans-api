"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("app"));
const email_1 = require("../../domains/email");
const { config: { app: { title } } } = app_1.default;
const email = {
    name: email_1.EmailType.ForgotPassword,
    templateName: 'forgot',
    buildData(payload) {
        return {
            appName: title,
            name: payload.username,
            url: `${payload.baseUrl}?token=${payload.token}`,
        };
    },
    buildSubject() {
        return 'Reset password';
    },
};
exports.default = email;
//# sourceMappingURL=forgotPassword.email.js.map