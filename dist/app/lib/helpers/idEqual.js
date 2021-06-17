"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = (id1, id2) => {
    if (typeof id1.equals === 'function') {
        return id1.equals(id2);
    }
    else if (typeof id2.equals === 'function') {
        return id2.equals(id1);
    }
    else {
        return id1 === id2;
    }
};
//# sourceMappingURL=idEqual.js.map