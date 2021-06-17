"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StrikeTargetModelValues = exports.StrikeTargetModel = exports.StrikeTypeValues = exports.StrikeType = exports.StrikeStateValues = exports.StrikeState = void 0;
var StrikeState;
(function (StrikeState) {
    StrikeState["Created"] = "created";
    StrikeState["Confirmed"] = "confirmed";
    StrikeState["Revoked"] = "revoked";
})(StrikeState = exports.StrikeState || (exports.StrikeState = {}));
exports.StrikeStateValues = Object
    .values(StrikeState)
    .filter((x) => typeof x === 'string');
var StrikeType;
(function (StrikeType) {
    StrikeType["Abuse"] = "abuse";
    StrikeType["Nudity"] = "nudity";
    StrikeType["Spam"] = "spam";
    StrikeType["WrongAccountType"] = "wrongAccountType";
})(StrikeType = exports.StrikeType || (exports.StrikeType = {}));
exports.StrikeTypeValues = Object
    .values(StrikeType)
    .filter((x) => typeof x === 'string');
var StrikeTargetModel;
(function (StrikeTargetModel) {
    StrikeTargetModel["Album"] = "Album";
    StrikeTargetModel["Message"] = "Message";
    StrikeTargetModel["Photo"] = "Photo";
    StrikeTargetModel["Video"] = "Video";
})(StrikeTargetModel = exports.StrikeTargetModel || (exports.StrikeTargetModel = {}));
exports.StrikeTargetModelValues = Object
    .values(StrikeTargetModel)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=strike.js.map