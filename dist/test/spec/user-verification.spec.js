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
describe('User Verification', () => {
    before('cleaning up emails', () => specHelper_1.default.fetchAndClearSentEmails());
    describe('Sign up', () => {
        let userDoc;
        let sentEmails;
        specHelper_1.default.withUser({
            key: 'newUser',
            login: false,
        });
        before('wait event processing', (done) => {
            setTimeout(done, 500);
        });
        before('fetch emails', () => __awaiter(void 0, void 0, void 0, function* () {
            sentEmails = yield specHelper_1.default.fetchAndClearSentEmails();
        }));
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                userDoc = yield User
                    .findOne({ _id: this.newUser._id })
                    .select('emailVerified emailVerification')
                    .lean();
            });
        });
        it('should set verification fields', function check() {
            specHelper_1.default.maskPaths(userDoc, [
                '_id',
                'emailVerification.token',
                'emailVerification.expires',
            ]).should.matchSnapshot(this);
        });
        it('should send verification email with token', function check() {
            var _a;
            specHelper_1.default.maskPaths(sentEmails, [
                'to',
                {
                    replace: 'html',
                    withValue: `${this.newUser.email}|${(_a = userDoc.emailVerification) === null || _a === void 0 ? void 0 : _a.token}`,
                    newValue: '<REPLACED>',
                },
            ]).should.matchSnapshot(this);
        });
    });
    describe('Resend verification email', () => {
        describe('not verified user', () => {
            let userDoc;
            let sentEmails;
            specHelper_1.default.withUser({
                key: 'newUser',
            });
            before('wait event processing', (done) => {
                setTimeout(done, 500);
            });
            before('cleanup emails', () => specHelper_1.default.fetchAndClearSentEmails());
            before('remove verification data', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    return User
                        .updateOne({ _id: this.newUser._id }, { $unset: { emailVerification: '' } });
                });
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/resend-verification`, {}, { headers: { Authorization: `Bearer ${this.newUser.auth.access_token}` } });
            }, 204);
            before('wait event processing', (done) => {
                setTimeout(done, 500);
            });
            before('fetch emails', () => __awaiter(void 0, void 0, void 0, function* () {
                sentEmails = yield specHelper_1.default.fetchAndClearSentEmails();
            }));
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    userDoc = yield User
                        .findOne({ _id: this.newUser._id })
                        .select('emailVerified emailVerification')
                        .lean();
                });
            });
            it('should set verification fields', function check() {
                specHelper_1.default.maskPaths(userDoc, [
                    '_id',
                    'emailVerification.token',
                    'emailVerification.expires',
                ]).should.matchSnapshot(this);
            });
            it('should send verification email with token', function check() {
                var _a;
                specHelper_1.default.maskPaths(sentEmails, [
                    'to',
                    {
                        replace: 'html',
                        withValue: `${this.newUser.email}|${(_a = userDoc.emailVerification) === null || _a === void 0 ? void 0 : _a.token}`,
                        newValue: '<REPLACED>',
                    },
                ]).should.matchSnapshot(this);
            });
        });
        describe('verified user', () => {
            specHelper_1.default.withUser({
                key: 'newUser',
            });
            before('wait event processing', (done) => {
                setTimeout(done, 500);
            });
            before('cleanup emails', () => specHelper_1.default.fetchAndClearSentEmails());
            before('set verified', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    return User
                        .updateOne({ _id: this.newUser._id }, { emailVerified: true });
                });
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.put(`${config_1.default.baseUrl}/users/resend-verification`, {}, { headers: { Authorization: `Bearer ${this.newUser.auth.access_token}` } });
            }, 400, {});
        });
    });
    describe('Verify email', () => {
        const prepareTest = (status, token, beforeFn) => {
            specHelper_1.default.withUser({
                key: 'user',
            });
            before('wait event processing', (done) => {
                setTimeout(done, 500);
            });
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    if (!token) {
                        ({ emailVerification: { token: this.token } } = yield User
                            .findOne({ _id: this.user._id })
                            .select('emailVerification.token')
                            .lean());
                    }
                    else {
                        this.token = token;
                    }
                });
            });
            if (beforeFn) {
                before(beforeFn);
            }
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/verify-email/${this.token}`, Object.assign({}, specHelper_1.default.getClientAuth()));
            }, status, status !== 204 ? {} : undefined);
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    ({ emailVerified: this.emailVerified } = yield User
                        .findOne({ _id: this.user._id })
                        .select('emailVerified')
                        .lean());
                });
            });
        };
        describe('with valid token', () => {
            prepareTest(204);
            it('should set email verified', function () {
                return chai_1.expect(this.emailVerified).to.be.true;
            });
        });
        describe('with expired token', () => {
            prepareTest(400, undefined, function expireToken() {
                return User.updateOne({ _id: this.user._id }, { 'emailVerification.expires': new Date() });
            });
            it('should not set email verified', function () {
                return chai_1.expect(this.emailVerified).to.be.false;
            });
        });
        describe('with wrong token', () => {
            prepareTest(400, 'wrong token');
            it('should not set email verified', function () {
                return chai_1.expect(this.emailVerified).to.be.false;
            });
        });
    });
});
//# sourceMappingURL=user-verification.spec.js.map