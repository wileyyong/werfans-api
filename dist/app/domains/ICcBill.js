"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICcBill = void 0;
var ICcBill;
(function (ICcBill) {
    let EventType;
    (function (EventType) {
        EventType["NewSaleSuccess"] = "NewSaleSuccess";
        EventType["NewSaleFailure"] = "NewSaleFailure";
        EventType["Cancellation"] = "Cancellation";
        EventType["Expiration"] = "Expiration";
    })(EventType = ICcBill.EventType || (ICcBill.EventType = {}));
    let CurrencyCode;
    (function (CurrencyCode) {
        CurrencyCode["AUD"] = "036";
        CurrencyCode["CAD"] = "124";
        CurrencyCode["JPY"] = "392";
        CurrencyCode["GBP"] = "826";
        CurrencyCode["USD"] = "840";
        CurrencyCode["EUR"] = "978";
    })(CurrencyCode = ICcBill.CurrencyCode || (ICcBill.CurrencyCode = {}));
})(ICcBill = exports.ICcBill || (exports.ICcBill = {}));
//# sourceMappingURL=ICcBill.js.map