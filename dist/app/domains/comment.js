"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CommentRoutes = exports.CommentTargetValues = exports.CommentTargetModels = void 0;
var CommentTargetModels;
(function (CommentTargetModels) {
    CommentTargetModels["LiveStream"] = "LiveStream";
})(CommentTargetModels = exports.CommentTargetModels || (exports.CommentTargetModels = {}));
exports.CommentTargetValues = Object
    .values(CommentTargetModels)
    .filter((x) => typeof x === 'string');
exports.CommentRoutes = [{
        route: 'live-streams',
        targetModel: exports.CommentTargetValues[0],
    }];
//# sourceMappingURL=comment.js.map