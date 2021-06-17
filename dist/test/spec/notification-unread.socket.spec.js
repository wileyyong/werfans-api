"use strict";
/**
 * Created by mk on 08/07/16.
 */
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
const chai_1 = __importDefault(require("chai"));
const app_1 = __importDefault(require("app"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { expect } = chai_1.default;
describe('Notification Unread', () => {
    const userNotification = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.NOTIFICATION);
    const globalNotification = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.NOTIFICATION);
    specHelper_1.default.withUserSocket();
    specHelper_1.default.withUser({
        key: 'otherUser',
    });
    describe('Get initial unread notifications', () => {
        let notificationsList;
        let notificationsList2;
        before('get notifications', function () {
            return __awaiter(this, void 0, void 0, function* () {
                notificationsList = yield specHelper_1.default.getNotifications(this.user);
                notificationsList2 = yield specHelper_1.default.getNotifications(this.otherUser);
            });
        });
        it('initial notifications should be equal 0', () => {
            expect(notificationsList.length).to.be.equal(0);
            expect(notificationsList2.length).to.be.equal(0);
        });
    });
    describe('Create notification', () => {
        let userNotifications;
        let otherUserNotifications;
        before('create notification', function () {
            return specHelper_1.default.createNotification(userNotification, [this.user]);
        });
        before('create notification', () => specHelper_1.default.createNotification(globalNotification, []));
        before('get notifications for user', function () {
            return __awaiter(this, void 0, void 0, function* () {
                userNotifications = yield specHelper_1.default.getNotifications(this.user);
            });
        });
        before('getx notification for otherUser', function () {
            return __awaiter(this, void 0, void 0, function* () {
                otherUserNotifications = yield specHelper_1.default.getNotifications(this.otherUser);
            });
        });
        after('remove notifications', () => __awaiter(void 0, void 0, void 0, function* () {
            yield specHelper_1.default.removeNotification(userNotification);
            yield specHelper_1.default.removeNotification(globalNotification);
        }));
        it('userNotifications.length for user should be equal 2', () => expect(userNotifications.length).to.be.equal(2));
        it('otherUserNotifications.length for otherUser should be equal 1', () => expect(otherUserNotifications.length).to.be.equal(1));
    });
    describe('Mark userNotification as read', () => {
        let isNotificationCame;
        let notificationId;
        let notification;
        before('wait notification', function () {
            this.userSocket.once('new-user-notification', (data) => {
                isNotificationCame = true;
                notificationId = data.data._id;
            });
        });
        before('create user notification', function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield app_1.default.notificationService.createNotification(Object.assign(Object.assign({}, userNotification), { recipients: [this.user._id] }));
            });
        });
        before(() => specHelper_1.default.waitFor(() => isNotificationCame));
        specHelper_1.default.checkSocketResponse('userSocket', function () {
            return {
                route: 'delete:/users/:recipient/notifications/:_id/unread',
                params: {
                    recipient: this.user._id,
                    _id: notificationId,
                },
            };
        }, 204);
        before('get userNotification', () => __awaiter(void 0, void 0, void 0, function* () {
            notification = yield specHelper_1.default.getNotificationFromDb({ _id: notificationId });
        }));
        it('length of unread for userNotification should be 0', () => expect(notification.unread.length).to.be.equal(0));
    });
    after('remove globalNotification', () => specHelper_1.default.removeNotification(globalNotification));
    after('remove userNotification', () => specHelper_1.default.removeNotification(userNotification));
});
//# sourceMappingURL=notification-unread.socket.spec.js.map