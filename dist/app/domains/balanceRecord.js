"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BalanceRecordTypeValues = exports.BalanceRecordType = void 0;
var BalanceRecordType;
(function (BalanceRecordType) {
    BalanceRecordType["GoalReached"] = "GoalReached";
    BalanceRecordType["LoadBalance"] = "LoadBalance";
    BalanceRecordType["PurchaseContent"] = "PurchaseContent";
    BalanceRecordType["Reverting"] = "Reverting";
    BalanceRecordType["Sale"] = "Sale";
    BalanceRecordType["SendTip"] = "SendTip";
    BalanceRecordType["Deposit"] = "Deposit";
})(BalanceRecordType = exports.BalanceRecordType || (exports.BalanceRecordType = {}));
exports.BalanceRecordTypeValues = Object
    .values(BalanceRecordType)
    .filter((x) => typeof x === 'string');
//# sourceMappingURL=balanceRecord.js.map