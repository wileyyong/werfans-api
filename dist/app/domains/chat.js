"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChatTypeValues = exports.ChatType = void 0;
var ChatType;
(function (ChatType) {
    ChatType["Private"] = "private";
    ChatType["LiveStream"] = "liveStream";
})(ChatType = exports.ChatType || (exports.ChatType = {}));
exports.ChatTypeValues = Object
    .values(ChatType)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=chat.js.map