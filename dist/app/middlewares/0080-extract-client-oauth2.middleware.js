"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (expressApp) => {
    expressApp.use((req, res, next) => {
        // Code was taken from here: https://github.com/jshttp/basic-auth/blob/master/index.js
        let auth = req.headers.authorization;
        if (!auth) {
            return next();
        }
        // malformed
        const parts = auth.split(' ');
        if (parts[0].toLowerCase() !== 'basic') {
            return next();
        }
        if (!parts[1]) {
            return next();
        }
        [, auth] = parts;
        // credentials
        auth = Buffer.from(auth, 'base64').toString();
        const matchResult = auth.match(/^([^:]*):(.*)$/);
        if (!matchResult) {
            return next();
        }
        if (!req.body) {
            req.body = {};
        }
        [, req.body.client_id, req.body.client_secret] = matchResult;
        return next();
    });
};
//# sourceMappingURL=0080-extract-client-oauth2.middleware.js.map