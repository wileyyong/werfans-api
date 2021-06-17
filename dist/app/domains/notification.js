"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SignalType = exports.NotificationTypeValues = exports.NotificationType = void 0;
var NotificationType;
(function (NotificationType) {
    NotificationType["AlbumCreated"] = "AlbumCreated";
    NotificationType["LiveStreamScheduled"] = "LiveStreamScheduled";
    NotificationType["LiveStreamStarted"] = "LiveStreamStarted";
    NotificationType["LiveStreamStarting"] = "LiveStreamStarting";
    NotificationType["LiveStreamGoalChanged"] = "LiveStreamGoalChanged";
    NotificationType["PhotoAdded"] = "PhotoAdded";
    NotificationType["PrivateMessageReceived"] = "PrivateMessageReceived";
    NotificationType["StrikeCreated"] = "StrikeCreated";
    NotificationType["Testing"] = "Testing";
    NotificationType["VideoUploaded"] = "VideoUploaded";
})(NotificationType = exports.NotificationType || (exports.NotificationType = {}));
exports.NotificationTypeValues = Object
    .values(NotificationType)
    .filter((x) => typeof x === 'string');
var SignalType;
(function (SignalType) {
    SignalType["PurchaseResult"] = "PurchaseResult";
    SignalType["SubscriptionCanceled"] = "SubscriptionCanceled";
})(SignalType = exports.SignalType || (exports.SignalType = {}));
//# sourceMappingURL=notification.js.map