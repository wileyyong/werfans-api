"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
exports.default = (app) => {
    const expressApp = express_1.default();
    expressApp.enable('trust proxy');
    app.middlewares.forEach((middleware) => middleware(expressApp, app));
    app.registerProvider('expressApp', () => expressApp);
};
//# sourceMappingURL=express.maker.js.map