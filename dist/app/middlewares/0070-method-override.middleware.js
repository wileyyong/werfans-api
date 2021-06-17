"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const method_override_1 = __importDefault(require("method-override"));
exports.default = (expressApp) => {
    expressApp.use(method_override_1.default());
};
//# sourceMappingURL=0070-method-override.middleware.js.map