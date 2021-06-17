"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (expressApp) => {
    // Assume 404 since no middleware responded
    expressApp.use((req, res) => {
        res.status(404);
        if (req.method === 'HEAD') {
            return res.end();
        }
        return res.send({
            type: 'Express',
            error: 'PathNotFound',
            message: 'Not Found',
            url: req.originalUrl,
        });
    });
};
//# sourceMappingURL=0160-not-found.middleware.js.map