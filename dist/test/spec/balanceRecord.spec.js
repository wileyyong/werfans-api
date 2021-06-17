"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const balanceRecord_1 = require("../../app/domains/balanceRecord");
const maskingFields = [
    '_id',
    'price',
    'owner',
    'createdAt',
    'updatedAt',
];
describe('BalanceRecord', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        seed: 2,
    });
    describe('Create', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(`${config_1.default.baseUrl}/users/me/balance-records`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 404, {});
    });
    describe('Get list', () => {
        describe('by owner', () => {
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.LoadBalance,
                sum: 100,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/me/balance-records`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: maskingFields,
            });
        });
        describe('by other user', () => {
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.LoadBalance,
                sum: 100,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/balance-records`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Get one', () => {
        describe('by recipient', () => {
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.LoadBalance,
                sum: 100,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/balance-records/${this.balanceRecord._id}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: maskingFields,
            });
        });
        describe('by other user', () => {
            specHelper_1.default.withBalanceRecord({
                type: balanceRecord_1.BalanceRecordType.LoadBalance,
                sum: 100,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/balance-records/${this.balanceRecord._id}`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
    });
    describe('Update', () => {
        specHelper_1.default.withBalanceRecord({
            type: balanceRecord_1.BalanceRecordType.LoadBalance,
            sum: 100,
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/me/balance-records/${this.balanceRecord._id}`, { type: 'Testing' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 404, {
            mask: ['url'],
        });
    });
    describe('Delete', () => {
        specHelper_1.default.withBalanceRecord({
            type: balanceRecord_1.BalanceRecordType.LoadBalance,
            sum: 100,
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/me/balance-records/${this.balanceRecord._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 404, {
            mask: ['url'],
        });
    });
});
//# sourceMappingURL=balanceRecord.spec.js.map