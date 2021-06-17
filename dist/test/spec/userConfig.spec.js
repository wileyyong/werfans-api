"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const chai_1 = require("chai");
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const MASKING_FIELDS = [
    '_id',
    'user',
    'createdAt',
    'updatedAt',
];
describe('User Config', () => {
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
    const otherUserData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2);
    const userConfigData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER_CONFIG, 1);
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        data: userData,
        key: 'user',
    });
    specHelper_1.default.withUser({
        data: otherUserData,
        key: 'otherUser',
    });
    describe('Create', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.put(`${config_1.default.baseUrl}/users/me/configs/${userConfigData.key}`, userConfigData, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 201, {
            mask: MASKING_FIELDS,
        });
        after(function () {
            return specHelper_1.default.removeUserConfig(this.response.body);
        });
        it('should have user equal to current user', function () {
            chai_1.expect(this.response.body.user).to.be.equal(this.user._id);
        });
    });
    describe('Get List', () => {
        specHelper_1.default.withUserConfig({
            data: userConfigData,
        });
        describe('by owner', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/me/configs`, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS,
            });
        });
        describe('by admin', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/configs`, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS,
            });
        });
        describe('by otherUser', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/configs`, {
                    headers: {
                        Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                    },
                });
            }, 403, {
                description: 'should return Forbidden',
            });
        });
    });
    describe('Get One', () => {
        specHelper_1.default.withUserConfig({
            data: userConfigData,
        });
        describe('by owner', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/me/configs/${this.userConfig.key}`, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS,
            });
            it('should have user equal to user', function () {
                chai_1.expect(this.response.body.user).to.be.equal(this.user._id);
            });
        });
        describe('by admin', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/configs/${this.userConfig.key}`, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS,
            });
            it('should have user equal to user', function () {
                chai_1.expect(this.response.body.user).to.be.equal(this.user._id);
            });
        });
    });
    describe('Change', () => {
        const NEW_DATA = 'new-data';
        specHelper_1.default.withUserConfig({
            data: userConfigData,
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/me/configs/${this.userConfig.key}`, {
                data: NEW_DATA,
            }, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 200, {
            mask: MASKING_FIELDS,
        });
    });
    describe('Remove', () => {
        specHelper_1.default.withUserConfig({
            data: userConfigData,
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/me/configs/${this.userConfig.key}`, {}, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 204);
    });
});
//# sourceMappingURL=userConfig.spec.js.map