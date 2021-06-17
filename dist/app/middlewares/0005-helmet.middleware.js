"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const helmet_1 = __importDefault(require("helmet"));
exports.default = (expressApp) => {
    expressApp.use(helmet_1.default());
};
//# sourceMappingURL=0005-helmet.middleware.js.map