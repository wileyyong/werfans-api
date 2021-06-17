"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const maskingFields = [
    '_id',
    'price',
    'owner',
    'createdAt',
    'updatedAt',
];
describe('Notification', () => {
    const notification = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.NOTIFICATION);
    const globalNotification = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.NOTIFICATION);
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        seed: 2,
    });
    const withNotification = (isGlobal, recipientKeys = ['user']) => {
        before('create notification', function () {
            this.notification = lodash_1.default.cloneDeep(isGlobal ? globalNotification : notification);
            return specHelper_1.default.createNotification(this.notification, !isGlobal
                ? recipientKeys.map((recipientKey) => this[recipientKey])
                : undefined);
        });
        after(function () {
            return specHelper_1.default.removeNotification(this.notification);
        });
    };
    describe('Create', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(`${config_1.default.baseUrl}/users/me/notifications`, notification, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 404, {});
    });
    describe('Get list', () => {
        describe('by owner', () => {
            withNotification(false);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/me/notifications`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: maskingFields,
            });
        });
        describe('by other user', () => {
            withNotification(false);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/notifications`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Get one', () => {
        describe('for personal', () => {
            describe('by recipient', () => {
                withNotification(false);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/notifications/${this.notification._id}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                }, 200, {
                    mask: maskingFields,
                });
            });
            describe('by other user', () => {
                withNotification(false);
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/notifications/${this.notification._id}`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
                }, 403, {});
            });
        });
        describe('for global', () => {
            withNotification(true);
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/notifications/${this.notification._id}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: maskingFields,
            });
        });
    });
    describe('Update', () => {
        withNotification(false);
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/me/notifications/${this.notification._id}`, { type: 'Testing' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 404, {
            mask: ['url'],
        });
    });
    describe('Delete', () => {
        withNotification(false);
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/me/notifications/${this.notification._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 404, {
            mask: ['url'],
        });
    });
});
//# sourceMappingURL=notification.spec.js.map