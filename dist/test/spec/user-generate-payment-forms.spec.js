"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const url_1 = __importDefault(require("url"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const chai_1 = require("chai");
describe('REST /users - User generate payment forms', () => {
    describe('GET /:_id/generateFormUrl/:period', () => {
        describe('Generate form URL', () => {
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
                key: 'user',
            });
            describe('with right period', () => {
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/generateFormUrl/30`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                }, 200);
                it('should match snapshot', function () {
                    const METADATA_OCCUPANCY = 'metadata=';
                    const { url: urlStr } = this.response.body;
                    const fromIdx = urlStr.indexOf('metadata=');
                    const toIdx = urlStr.indexOf('&', fromIdx);
                    const metadataValue = urlStr.slice(fromIdx + METADATA_OCCUPANCY.length, toIdx);
                    this.response.body.url = urlStr.replace(metadataValue, 'xxx');
                    chai_1.expect(this.response.body).matchSnapshot(this);
                });
                it('should contain user price', function () {
                    const parsedUrl = url_1.default.parse(this.response.body.url, true);
                    chai_1.expect(parsedUrl.query.initialPrice).to.equal('49.99');
                    chai_1.expect(parsedUrl.query.recurringPrice).to.equal('49.99');
                });
                it('should contain period', function () {
                    const parsedUrl = url_1.default.parse(this.response.body.url, true);
                    chai_1.expect(parsedUrl.query.initialPeriod).to.equal('30');
                    chai_1.expect(parsedUrl.query.recurringPeriod).to.equal('30');
                });
            });
            describe('with wrong period', () => {
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/generateFormUrl/3`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                }, 400, {});
            });
        });
    });
    describe('GET /:_id/deposit/:summ', () => {
        describe('Generate form URL', () => {
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
                key: 'user',
            });
            describe('with right summ', () => {
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/deposit/30`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                }, 200);
                it('should match snapshot', function () {
                    const METADATA_OCCUPANCY = 'metadata=';
                    const { url: urlStr } = this.response.body;
                    const fromIdx = urlStr.indexOf('metadata=');
                    const toIdx = urlStr.indexOf('&', fromIdx);
                    const metadataValue = urlStr.slice(fromIdx + METADATA_OCCUPANCY.length, toIdx);
                    this.response.body.url = urlStr.replace(metadataValue, 'xxx');
                    chai_1.expect(this.response.body).matchSnapshot(this);
                });
                it('should contain user price', function () {
                    const parsedUrl = url_1.default.parse(this.response.body.url, true);
                    chai_1.expect(parsedUrl.query.initialPrice).to.equal('30.00');
                });
                it('should contain period', function () {
                    const parsedUrl = url_1.default.parse(this.response.body.url, true);
                    chai_1.expect(parsedUrl.query.initialPeriod).to.equal('90');
                });
            });
            const createTest = (summ) => () => {
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/deposit/${summ}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                }, 400, {});
            };
            describe('with wrong summ lower than 3', createTest(1));
            describe('with wrong summ greater than 100', createTest(101));
        });
    });
});
//# sourceMappingURL=user-generate-payment-forms.spec.js.map