"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const ajv_1 = __importDefault(require("ajv"));
module.exports = () => new ajv_1.default({ allErrors: true, jsonPointers: true, nullable: true });
//# sourceMappingURL=ajvFactory.js.map