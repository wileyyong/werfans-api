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
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { modelProvider: { User } } = app_1.default;
const withResetPasswordToken = () => {
    before(function () {
        this.token = 'validToken';
        const expires = Date.now() + 10000;
        return User.updateOne({ _id: this.user._id }, {
            'resetPassword.token': this.token,
            'resetPassword.expires': expires,
        });
    });
};
describe('User Auth ', () => {
    const userData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
    const otherUserData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2);
    describe('POST /logout - Logout', () => {
        specHelper_1.default.withUser({
            data: userData,
            key: 'user',
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(`${config_1.default.baseUrl}/users/logout`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 204);
    });
    describe('POST /:_id/change-password - Change password', () => {
        const newPassword = 'newPassword';
        describe('by owner', () => {
            specHelper_1.default.withUser({
                data: userData,
                key: 'user',
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/me/change-password`, {
                    password: this.user.password,
                    newPassword,
                }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 204);
        });
        describe('by other user', () => {
            specHelper_1.default.withUser({
                data: userData,
                key: 'user',
            });
            specHelper_1.default.withUser({
                data: otherUserData,
                key: 'otherUser',
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.user._id}/change-password`, {
                    password: this.user.password,
                    newPassword,
                }, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 400, { mask: [] });
        });
    });
    describe('POST /forgot - Forgot password', () => {
        describe('by owner', () => {
            let userDoc;
            let sentEmails;
            specHelper_1.default.withUser({
                data: userData,
                key: 'user',
            });
            before('cleaning up emails', () => specHelper_1.default.fetchAndClearSentEmails());
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/forgot`, Object.assign(Object.assign({}, specHelper_1.default.getClientAuth()), { username: this.user.username }));
            }, 204);
            before('wait event processing', (done) => {
                setTimeout(done, 500);
            });
            before('fetch user from db', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    userDoc = yield User.findById(this.user._id).select('resetPassword').lean();
                });
            });
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                sentEmails = yield specHelper_1.default.fetchAndClearSentEmails();
            }));
            it('should set reset token for user in db', () => { var _a; return chai_1.expect((_a = userDoc.resetPassword) === null || _a === void 0 ? void 0 : _a.token).to.exist; });
            it('should contain 1 email', () => chai_1.expect(sentEmails.length).to.be.equal(1));
            it('email should be sent to this user', function () {
                return chai_1.expect(sentEmails[0].to).to.be.equal(this.user.username.toLowerCase());
            });
            it('email should contain reset token of to this user', function () {
                this.user.resetPassword = userDoc.resetPassword;
                return chai_1.expect(sentEmails[0].html.indexOf(this.user.resetPassword.token)).to.be.above(-1);
            });
        });
        describe('for not existing user', () => {
            specHelper_1.default.withUser({
                data: userData,
                key: 'user',
            });
            specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/users/forgot`, Object.assign(Object.assign({}, specHelper_1.default.getClientAuth()), { username: 'someFakeUserName' })), 400, { mask: [] });
        });
    });
    describe('POST _id/reset/:token - Reset password', () => {
        describe('with valid token', () => {
            let sentEmails;
            specHelper_1.default.withUser({
                data: userData,
                key: 'user',
            });
            before('cleaning up emails', () => specHelper_1.default.fetchAndClearSentEmails());
            withResetPasswordToken();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/reset/${this.token}`, Object.assign(Object.assign({}, specHelper_1.default.getClientAuth()), { newPassword: 'completelyOtherPassword' }));
            }, 200, { mask: ['access_token', 'refresh_token'] });
            before('wait event processing', (done) => {
                setTimeout(done, 500);
            });
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                sentEmails = yield specHelper_1.default.fetchAndClearSentEmails();
            }));
            it('should contain 1 email', () => chai_1.expect(sentEmails.length).to.be.equal(1));
        });
        describe('with invalid token', () => {
            let sentEmails;
            specHelper_1.default.withUser({
                data: userData,
                key: 'user',
            });
            before('cleaning up emails', () => specHelper_1.default.fetchAndClearSentEmails());
            withResetPasswordToken();
            specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/users/reset/invalidToken`, Object.assign(Object.assign({}, specHelper_1.default.getClientAuth()), { newPassword: 'completelyOtherPassword' })), 400, { mask: [] });
            before('wait event processing', (done) => {
                setTimeout(done, 500);
            });
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                sentEmails = yield specHelper_1.default.fetchAndClearSentEmails();
            }));
            it('should contain no email', () => chai_1.expect(sentEmails.length).to.be.equal(0));
        });
    });
});
//# sourceMappingURL=user-auth.spec.js.map