"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const compression_1 = __importDefault(require("compression"));
exports.default = (expressApp) => {
    expressApp.use(compression_1.default());
};
//# sourceMappingURL=0030-compress.middleware.js.map