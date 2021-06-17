"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (expressApp) => {
    expressApp.use((req, res, next) => {
        let oneOf = false;
        if (req.headers.origin) {
            res.header('Access-Control-Allow-Origin', req.headers.origin);
            oneOf = true;
        }
        if (req.headers['access-control-request-method']) {
            res.header('Access-Control-Allow-Methods', req.headers['access-control-request-method']);
            oneOf = true;
        }
        if (req.headers['access-control-request-headers']) {
            res.header('Access-Control-Allow-Headers', req.headers['access-control-request-headers']);
            oneOf = true;
        }
        if (oneOf) {
            res.header('Access-Control-Max-Age', `${60 * 60 * 24 * 365}`);
        }
        // intercept OPTIONS method
        if (oneOf && req.method === 'OPTIONS') {
            res.status(200).end();
        }
        else {
            next();
        }
    });
};
//# sourceMappingURL=0010-cross-domain.middleware.js.map