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
describe('Notification Service Email', () => {
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
    specHelper_1.default.withUser({
        data: userData,
        key: 'user',
    });
    describe('Send user notification', () => {
        describe('when NOT isEmailMuted', () => {
            let notification;
            let emails;
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
            it('should receive email', function () {
                return chai_1.expect(emails).to.matchSnapshot(this);
            });
        });
        describe('when isEmailMuted', () => {
            let notification;
            let emails;
            before('mute email notifications', function () {
                return User.updateOne({ _id: this.user._id }, { 'notificationSettings.isEmailMuted': true });
            });
            after('unmute email notifications', function () {
                return User.updateOne({ _id: this.user._id }, { $unset: { isEmailMuted: 1 } });
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
            it('should not receive email', () => chai_1.expect(emails.length).to.be.equal(0));
        });
    });
});
//# sourceMappingURL=notificationService.email.spec.js.map