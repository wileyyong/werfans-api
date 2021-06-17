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
describe('User Admin', () => {
    const goingToBeAdminUser = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER);
    goingToBeAdminUser.admin = true;
    describe('Sign up as admin', () => {
        let userDoc;
        specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/users`, Object.assign(Object.assign({}, goingToBeAdminUser), specHelper_1.default.getClientAuth())), 201);
        before('fetch user', function () {
            return __awaiter(this, void 0, void 0, function* () {
                userDoc = yield User.findOne({ _id: this.response.body._id }).lean();
            });
        });
        after(function () {
            return specHelper_1.default.removeUser(this.response.body);
        });
        it('should not set admin flag', () => chai_1.expect(userDoc.admin).to.be.not.true);
    });
    describe('Change admin flag', () => {
        describe('by owner (not admin)', () => {
            let userDoc;
            specHelper_1.default.withUser({
                data: goingToBeAdminUser,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}`, { admin: true }, {
                    headers: {
                        Authorization: `Bearer ${this.user.auth.access_token}`,
                    },
                });
            }, 200);
            before('fetch user', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    userDoc = yield User.findOne({ _id: this.user._id }).lean();
                });
            });
            it('should not set admin flag', () => chai_1.expect(userDoc.admin).to.be.not.true);
        });
        describe('by admin', () => {
            let userDoc;
            specHelper_1.default.withAdminUser();
            specHelper_1.default.withUser({
                data: goingToBeAdminUser,
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseAdminUrl}/users/${this.user._id}`, { admin: true }, {
                    headers: {
                        Authorization: `Bearer ${this.adminUser.auth.access_token}`,
                    },
                });
            }, 200);
            before('fetch user', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    userDoc = yield User.findOne({ _id: this.user._id }).lean();
                });
            });
            it('should set admin flag', () => chai_1.expect(userDoc.admin).to.be.true);
        });
    });
});
//# sourceMappingURL=user-admin.spec.js.map