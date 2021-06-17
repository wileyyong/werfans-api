"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const email_service_1 = __importDefault(require("app/lib/services/email.service"));
exports.default = (expressApp, { config: { isTest } }) => {
    if (isTest) {
        expressApp.get('/testing/sent-emails', (req, res) => {
            const { sentEmails } = email_service_1.default;
            email_service_1.default.sentEmails = [];
            res.json(sentEmails).end();
        });
    }
};
//# sourceMappingURL=0100-testing.middleware.js.map