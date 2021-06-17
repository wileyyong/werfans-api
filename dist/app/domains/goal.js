"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.GoalStateValues = exports.GoalState = void 0;
var GoalState;
(function (GoalState) {
    GoalState["Active"] = "active";
    GoalState["Cancelled"] = "cancelled";
    GoalState["Expired"] = "expired";
    GoalState["Reached"] = "reached";
})(GoalState = exports.GoalState || (exports.GoalState = {}));
exports.GoalStateValues = Object
    .values(GoalState)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=goal.js.map