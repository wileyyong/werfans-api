"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LiveStreamStateValues = exports.LiveStreamState = void 0;
var LiveStreamState;
(function (LiveStreamState) {
    LiveStreamState["Created"] = "created";
    LiveStreamState["Scheduled"] = "scheduled";
    LiveStreamState["OnAir"] = "onAir";
    LiveStreamState["Completed"] = "completed";
})(LiveStreamState = exports.LiveStreamState || (exports.LiveStreamState = {}));
exports.LiveStreamStateValues = Object
    .values(LiveStreamState)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=liveStream.js.map