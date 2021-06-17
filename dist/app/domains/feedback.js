"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FeedbackTypeValues = exports.FeedbackType = void 0;
var FeedbackType;
(function (FeedbackType) {
    FeedbackType["Suggestion"] = "suggestion";
    FeedbackType["SupportRequest"] = "supportRequest";
})(FeedbackType = exports.FeedbackType || (exports.FeedbackType = {}));
exports.FeedbackTypeValues = Object
    .values(FeedbackType)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=feedback.js.map