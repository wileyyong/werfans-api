"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (expressApp, app) => {
    const log = app.createLog(module);
    expressApp.use((err, req, res, next) => {
        var _a, _b;
        // If the error object doesn't exists
        if (!err) {
            return next();
        }
        // Log it
        log.error(err);
        log.error(`Stack: ${err.stack}`);
        // Error page
        res.status(err.status || ((_a = err.httpStatus) === null || _a === void 0 ? void 0 : _a.code) || 500);
        if (req.method === 'HEAD') {
            return res.end();
        }
        return res.send({
            type: err.type || 'Unknown',
            error: err.error || 'Unknown',
            message: err.message || ((_b = err.httpStatus) === null || _b === void 0 ? void 0 : _b.message),
            error_description: err.error_description,
        });
    });
};
//# sourceMappingURL=0150-handle-errors.middleware.js.map