"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (expressApp, { config: { urls: { defaultClientOrigin } } }) => {
    expressApp.use((req, res, next) => {
        if (!req.headers.referer) {
            req.headers.referer = `${req.protocol}://${defaultClientOrigin}`;
        }
        next();
    });
};
//# sourceMappingURL=0090-set-referer.middleware.js.map