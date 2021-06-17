"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IllegalStateError = void 0;
class IllegalStateError extends Error {
    constructor(message) {
        super(`Illegal state${message ? `: ${message}` : ''}`);
    }
}
exports.IllegalStateError = IllegalStateError;
//# sourceMappingURL=exceptions.js.map