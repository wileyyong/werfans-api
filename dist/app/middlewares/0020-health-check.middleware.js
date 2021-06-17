"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const health_service_1 = __importDefault(require("app/lib/services/health.service"));
exports.default = (expressApp) => {
    expressApp.use((req, res, next) => {
        const matchingPath = req.url.match(/^\/health$/);
        if (!matchingPath) {
            return next();
        }
        return res.status(health_service_1.default.isOk() ? 200 : 503).json(health_service_1.default.getData());
    });
};
//# sourceMappingURL=0020-health-check.middleware.js.map