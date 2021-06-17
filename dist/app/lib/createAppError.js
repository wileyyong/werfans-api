"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_node_1 = __importDefault(require("http-status-node"));
module.exports = function createAppError(rule, value) {
    const { message, name, httpStatus = http_status_node_1.default.BAD_REQUEST } = rule;
    return httpStatus.createError(message, {
        type: 'app',
        error: 'RulesViolation',
        details: {
            rule: name,
            value,
        },
    });
};
//# sourceMappingURL=createAppError.js.map