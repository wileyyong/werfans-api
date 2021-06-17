"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
describe('User Public', () => {
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
    const otherUserData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2);
    Object.assign(otherUserData, {
        about: 'I am',
        birthDate: '2000-01-01',
        fullName: 'Should not be visible',
        location: [0, 0],
        publicFields: { birthDate: true },
    });
    specHelper_1.default.withUser({
        data: userData,
        key: 'user',
    });
    specHelper_1.default.withUser({
        data: otherUserData,
        key: 'otherUser',
        login: false,
    });
    describe('Get list', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/public`, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 200, {
            mask: [
                '_id',
                'createdAt',
                'updatedAt',
            ],
        });
    });
    describe('Get otherUser\'s record', () => {
        const createTest = (authorized) => () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.otherUser._id}/public`, {
                    headers: authorized ? { Authorization: `Bearer ${this.user.auth.access_token}` } : {},
                });
            }, 200, {
                mask: [
                    '_id',
                    'createdAt',
                    'updatedAt',
                ],
            });
            it('should be the same _id', function () {
                chai_1.expect(this.response.body).to.have.property('_id', this.otherUser._id);
            });
        };
        describe('Authorized', createTest(true));
        describe('Unathorized', createTest(false));
    });
});
//# sourceMappingURL=user-public.spec.js.map