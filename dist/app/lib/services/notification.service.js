"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationService = void 0;
const lodash_1 = __importDefault(require("lodash"));
const app_1 = __importDefault(require("app"));
const fromCallback_1 = __importDefault(require("../helpers/fromCallback"));
const email_1 = require("../../domains/email");
const { modelProvider: { Notification, User } } = app_1.default;
class NotificationService {
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            app_1.default.registerProvider('notificationService', this);
        });
    }
    createNotification(notificationData) {
        return __awaiter(this, void 0, void 0, function* () {
            const { recipients: originalRecipients } = notificationData;
            const { emailRecipients, inAppRecipients } = yield User.applyNotificationConfigsRules(originalRecipients || []);
            const isGlobal = !Array.isArray(originalRecipients);
            const readable = !isGlobal;
            const unread = inAppRecipients;
            // no recipients for notification
            if (!isGlobal && emailRecipients.length === 0 && inAppRecipients.length === 0) {
                return null;
            }
            const notification = (yield Notification.create(Object.assign(Object.assign({}, notificationData), { readable, unread })));
            if (isGlobal) {
                app_1.default.sio.sockets
                    .to('global-notifications')
                    .emit('new-global-notification', { data: notification });
            }
            else {
                const onlineUserIds = [];
                yield Promise.all((inAppRecipients).map((userId) => __awaiter(this, void 0, void 0, function* () {
                    const roomId = `user-notifications-#${userId}`;
                    const roomClients = yield fromCallback_1.default((callback) => (app_1.default.sio.of('/').adapter.clients([roomId], callback)));
                    if (roomClients.length) {
                        app_1.default.sio.sockets
                            .to(roomId)
                            .emit('new-user-notification', { data: notification });
                        onlineUserIds.push(userId);
                    }
                })));
                const adjustedEmailRecipients = lodash_1.default.difference(emailRecipients, onlineUserIds);
                const userEmails = yield User.getEmails(adjustedEmailRecipients, 'username');
                yield Promise.all(userEmails.map(({ email, username }) => (app_1.default.emailService.sendEmail(email_1.EmailType.Notification, {
                    email,
                    payload: {
                        username,
                        notificationType: notification.notificationType,
                        notificationBody: notification.body,
                        notificationMetadata: notification.metadata,
                    },
                }))));
            }
            return notification;
        });
    }
    createSignal(signal) {
        const isGlobal = !Array.isArray(signal.recipients);
        // no recipients for notification
        if (!isGlobal && signal.recipients.length === 0) {
            return;
        }
        if (isGlobal) {
            app_1.default.sio.sockets
                .to('global-notifications')
                .emit('new-global-signal', { data: signal });
        }
        else {
            signal.recipients.forEach((userId) => {
                app_1.default.sio.sockets
                    .to(`user-notifications-#${userId}`)
                    .emit('new-user-signal', { data: signal });
            });
        }
    }
}
exports.NotificationService = NotificationService;
const notificationService = new NotificationService();
exports.default = notificationService;
//# sourceMappingURL=notification.service.js.map