"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("app"));
const chai_1 = require("chai");
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const user_1 = require("../../app/domains/user");
const MASK_FIELDS = [
    '_id',
    'createdAt',
    'updatedAt',
    'auth.access_token',
    'auth.refresh_token',
];
const { consts: { METADATA: { dictionaries, }, }, } = app_1.default;
describe('REST /users', () => {
    const adminUser = specHelper_1.default.getDefaultAdminUser();
    describe('POST / - Create', () => {
        const user = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1);
        specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/users`, Object.assign(Object.assign({}, user), specHelper_1.default.getClientAuth())), 201, { mask: MASK_FIELDS });
        after('remove user', function () {
            return specHelper_1.default.removeUser(this.response.body);
        });
    });
    describe('GET / - Get list', () => {
        describe('by user', () => {
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
                key: 'user',
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 403);
        });
        describe('by admin', () => {
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
                key: 'user',
            });
            before('sign in admin', () => specHelper_1.default.signInUser(adminUser));
            specHelper_1.default.checkResponse(() => specHelper_1.default.get(`${config_1.default.baseAdminUrl}/users`, { headers: { Authorization: `Bearer ${adminUser.auth.access_token}` } }), 200, { mask: MASK_FIELDS });
        });
    });
    describe('GET /:_id - Get Profile', () => {
        describe('by owner', () => {
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
                key: 'user',
            });
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
                key: 'otherUser',
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/me`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, { mask: MASK_FIELDS });
            it('should be the same _id', function () {
                chai_1.expect(this.response.body._id).to.be.equal(this.user._id);
            });
        });
        describe('by other user', () => {
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
                key: 'user',
            });
            specHelper_1.default.withUser({
                data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
                key: 'otherUser',
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}`, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403);
        });
    });
    describe('Change Profile', () => {
        const NEW_VALUE = 'new-firstName';
        specHelper_1.default.withUser({
            data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
            key: 'user',
        });
        specHelper_1.default.withUser({
            data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
            key: 'otherUser',
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/me`, {
                firstName: NEW_VALUE,
                socialMediaLinks: {
                    [user_1.SocialMedia.Facebook]: {
                        url: 'fb.url',
                        wrong: 'wrong',
                    },
                    [user_1.SocialMedia.Tumblr]: {
                        url: 'Tumblr.url',
                    },
                    notSupported: {
                        url: 'notSupported.url',
                    },
                },
                age: 12,
                notificationSettings: {
                    isEmailMuted: true,
                    isInAppMuted: false,
                },
                entrepreneurType: user_1.EntrepreneurType.Founder,
                arr: {
                    value1: 1,
                    value2: 2,
                    value3: 3,
                    value4: 4,
                },
                mrr: {
                    value1: 1,
                    value2: 2,
                },
                serviceType: dictionaries.serviceTypes[0].id,
                industry: dictionaries.industry[0].id,
                office: dictionaries.office[0].id,
                region: dictionaries.region[0].id,
                pitchDeck: dictionaries.pitchDeck[0].id,
                rating: 3,
            }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 200, { mask: MASK_FIELDS });
        it('should be the same _id', function () {
            chai_1.expect(this.response.body._id).to.be.equal(this.user._id);
        });
    });
    describe('Remove Profile', () => {
        specHelper_1.default.withUser({
            data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 1),
            key: 'user',
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/me`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 204);
    });
});
//# sourceMappingURL=user.spec.js.map