"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (param, defaultValue) => {
    if (param === undefined) {
        return defaultValue;
    }
    else if (param === 'true') {
        return true;
    }
    else if (param === 'false') {
        return false;
    }
    else {
        return !!parseInt(param, 10);
    }
};
//# sourceMappingURL=toBoolean.js.map