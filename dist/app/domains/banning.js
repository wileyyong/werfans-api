"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BanningReasonTypeValues = exports.BanningReasonType = void 0;
var BanningReasonType;
(function (BanningReasonType) {
    BanningReasonType["ByAdmin"] = "byAdmin";
    BanningReasonType["ByStrikes"] = "byStrikes";
})(BanningReasonType = exports.BanningReasonType || (exports.BanningReasonType = {}));
exports.BanningReasonTypeValues = Object
    .values(BanningReasonType)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=banning.js.map