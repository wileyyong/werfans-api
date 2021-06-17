"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const body_parser_1 = __importDefault(require("body-parser"));
exports.default = (expressApp) => {
    expressApp.use(body_parser_1.default.urlencoded({
        extended: true,
    }));
    expressApp.use(body_parser_1.default.json());
};
//# sourceMappingURL=0060-body-parser.middleware.js.map