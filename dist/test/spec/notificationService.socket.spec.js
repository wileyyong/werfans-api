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
const chai_1 = require("chai");
const app_1 = __importDefault(require("app"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const notification_1 = require("../../app/domains/notification");
const { modelProvider: { User } } = app_1.default;
const MASKING_FIELD = [
    'data._id',
    'data.recipients',
    'data.unread',
    'data.createdAt',
    'data.updatedAt',
];
describe('Notification Service Socket', () => {
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER);
    const otherUserData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER);
    specHelper_1.default.withUserSocket({
        data: userData,
        userKey: 'user',
        key: 'userSocket',
    });
    specHelper_1.default.withUserSocket({
        data: otherUserData,
        userKey: 'otherUser',
        key: 'otherUserSocket',
    });
    describe('Send user notification', () => {
        describe('when NOT isInAppMuted', () => {
            let notification;
            let emails;
            specHelper_1.default.withSocketHandler({
                key: 'userSocket',
                eventName: 'new-user-notification',
                makeSnapShot: {
                    mask: MASKING_FIELD,
                    isForced: true,
                },
            });
            specHelper_1.default.withSocketHandler({
                key: 'otherUserSocket',
                eventName: 'new-user-notification',
                shouldBeSilent: true,
            });
            before(() => specHelper_1.default.fetchAndClearSentEmails());
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    notification = yield app_1.default.notificationService.createNotification({
                        notificationType: notification_1.NotificationType.Testing,
                        body: 'test',
                        recipients: [this.user._id],
                        metadata: {
                            field: 'value',
                        },
                    });
                });
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                emails = yield specHelper_1.default.fetchAndClearSentEmails();
            }));
            after('remove notification', () => specHelper_1.default.removeNotification(notification));
            it('notification should have the same _id', function () {
                return chai_1.expect(notification._id.toString()).to.be.equal(this.socketEventData.data._id);
            });
            it('should not send email', () => chai_1.expect(emails.length).to.be.equal(0));
        });
        describe('when isInAppMuted', () => {
            let notification;
            let emails;
            before('mute inApp notifications', function () {
                return User.updateOne({ _id: this.user._id }, { 'notificationSettings.isInAppMuted': true });
            });
            after('unmute inApp notifications', function () {
                return User.updateOne({ _id: this.user._id }, { $unset: { notificationSettings: 1 } });
            });
            specHelper_1.default.withSocketHandler({
                key: 'userSocket',
                eventName: 'new-user-notification',
                shouldBeSilent: true,
            });
            before(() => specHelper_1.default.fetchAndClearSentEmails());
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    notification = yield app_1.default.notificationService.createNotification({
                        notificationType: notification_1.NotificationType.Testing,
                        body: 'test',
                        recipients: [this.user._id],
                        metadata: {
                            field: 'value',
                        },
                    });
                });
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                emails = yield specHelper_1.default.fetchAndClearSentEmails();
            }));
            after('remove notification', () => specHelper_1.default.removeNotification(notification));
            it('should send email', () => chai_1.expect(emails.length).to.be.equal(1));
        });
    });
    describe('Send global notification', () => {
        let notification;
        specHelper_1.default.withSocketHandler({
            key: 'userSocket',
            eventName: 'new-global-notification',
            makeSnapShot: {
                mask: MASKING_FIELD,
            },
        });
        specHelper_1.default.withSocketHandler({
            key: 'otherUserSocket',
            eventName: 'new-global-notification',
        });
        before(() => __awaiter(void 0, void 0, void 0, function* () {
            notification = yield app_1.default.notificationService.createNotification({
                notificationType: notification_1.NotificationType.Testing,
                body: 'test',
                metadata: {
                    field: 'value',
                },
            });
        }));
        after('remove notification', () => specHelper_1.default.removeNotification(notification));
        it('notification should have the same _id', function () {
            return chai_1.expect(notification._id.toString()).to.be.equal(this.socketEventData.data._id);
        });
    });
});
//# sourceMappingURL=notificationService.socket.spec.js.map