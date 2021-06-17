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
    'author',
    'complainUser',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'author',
    'complainUser._id',
    'createdAt',
    'updatedAt',
];
describe('Report', () => {
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
    const complainUserData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2);
    const reportData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.REPORT, 1);
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        data: userData,
        key: 'user',
    });
    specHelper_1.default.withUser({
        data: complainUserData,
        key: 'complainUser',
    });
    before('prepare report', function () {
        reportData.complainUser = this.complainUser._id;
    });
    describe('Create', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(`${config_1.default.baseUrl}/users/me/reports`, reportData, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 201, {
            mask: MASKING_FIELDS,
        });
        after('remove report', function () {
            return specHelper_1.default.removeReport(this.response.body);
        });
        it('should have author user to current user', function () {
            chai_1.expect(this.response.body.author).to.be.equal(this.user._id);
        });
    });
    describe('Get List', () => {
        specHelper_1.default.withReport({
            data: reportData,
        });
        describe('by owner', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/reports`, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
        });
        describe('by admin', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/reports`, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
        });
    });
    describe('Get One', () => {
        specHelper_1.default.withReport({
            data: reportData,
        });
        describe('by owner', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/reports/${this.report._id}`, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
            it('should have author user to current user', function () {
                chai_1.expect(this.response.body.author._id).to.be.equal(this.user._id);
            });
        });
        describe('by admin', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/reports/${this.report._id}`, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
            it('should have author user to current user', function () {
                chai_1.expect(this.response.body.author._id).to.be.equal(this.user._id);
            });
        });
    });
    describe('Change', () => {
        const NEW_BODY = 'new-body';
        specHelper_1.default.withReport({
            data: reportData,
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.patch(`${config_1.default.baseUrl}/reports/${this.report._id}`, {
                body: NEW_BODY,
            }, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 404);
    });
    describe('Remove', () => {
        specHelper_1.default.withReport({
            data: reportData,
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.delete(`${config_1.default.baseUrl}/reports/${this.report._id}`, {}, {
                headers: {
                    Authorization: `Bearer ${this.user.auth.access_token}`,
                },
            });
        }, 404);
    });
});
//# sourceMappingURL=report.spec.js.map