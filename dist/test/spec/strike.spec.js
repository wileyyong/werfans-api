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
const app_1 = __importDefault(require("app"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const strike_1 = require("../../app/domains/strike");
const { consts: { events, }, modelProvider: { Strike, }, } = app_1.default;
const MASKING_FIELDS = [
    '_id',
    'creator',
    'targetUser',
    'type',
    'ref',
    'refModel',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'creator._id',
    'targetUser._id',
    'type._id',
    'ref',
    'refModel',
    'createdAt',
    'updatedAt',
];
describe('Strike', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        key: 'user',
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        seed: 2,
    });
    describe('Create', () => {
        const strikeData = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.STRIKE);
        before(function () {
            strikeData.targetUser = this.user._id;
        });
        describe('for admin', () => {
            specHelper_1.default.checkMoleculerEventEmit(events.strikes.created, true, {
                mask: ['_id', 'targetUser'],
            });
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/admin/users/${this.user._id}/strikes`, strikeData, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 201, {
                mask: MASKING_FIELDS,
            });
            after('remove strike', function () {
                return specHelper_1.default.removeStrike(this.response.body);
            });
        });
        describe('for user', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.user._id}/strikes`, strikeData, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
        describe('for unauthorized', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/users/${this.user._id}/strikes`, strikeData);
            }, 401, {});
        });
    });
    describe('Get list', () => {
        specHelper_1.default.withStrike();
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/strikes`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 200, {
            mask: MASKING_FIELDS_POPULATED,
        });
    });
    describe('Get one', () => {
        describe('for user', () => __awaiter(void 0, void 0, void 0, function* () {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/strikes/${this.strike._id}`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
        }));
        describe('for unauthorized', () => {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/users/${this.user._id}/strikes`);
            }, 401);
        });
    });
    describe('Update', () => {
        describe('for admin', () => {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/admin/strikes/${this.strike._id}`, { type: strike_1.StrikeType.Nudity }, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 200, {
                mask: MASKING_FIELDS_POPULATED,
            });
        });
        describe('for user', () => {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`, { type: strike_1.StrikeType.Nudity }, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403, {});
        });
        describe('for unauthorized', () => {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`, { type: strike_1.StrikeType.Nudity });
            }, 401);
        });
    });
    describe('Delete', () => {
        describe('for admin', () => {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/admin/strikes/${this.strike._id}`, {}, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
            }, 204);
        });
        describe('for user', () => {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.delete(`${config_1.default.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`, {}, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
            }, 403);
        });
        describe('for unauthorized', () => {
            specHelper_1.default.withStrike();
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.patch(`${config_1.default.baseUrl}/users/${this.user._id}/strikes/${this.strike._id}`, {});
            }, 401);
        });
    });
    describe('Change state', () => {
        const createTest = (newState, currentState, shouldFail, shouldExpectEvent) => {
            describe('for admin', () => {
                if (shouldExpectEvent) {
                    specHelper_1.default.checkMoleculerEventEmit(events.strikes.revoked, true, {
                        mask: ['_id', 'targetUser', 'ref'],
                    });
                }
                else {
                    specHelper_1.default.checkMoleculerEventEmit(events.strikes.revoked, false);
                }
                specHelper_1.default.withAlbum();
                specHelper_1.default.withStrike({
                    refKey: 'album',
                    refModel: strike_1.StrikeTargetModel.Album,
                });
                if (currentState && currentState !== strike_1.StrikeState.Created) {
                    before(function () {
                        return __awaiter(this, void 0, void 0, function* () {
                            yield Strike.updateOne({ _id: this.strike._id }, { state: currentState });
                        });
                    });
                }
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.post(`${config_1.default.baseUrl}/admin/strikes/${this.strike._id}/${newState}`, {}, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
                }, !shouldFail ? 200 : 400, !shouldFail
                    ? {
                        mask: MASKING_FIELDS_POPULATED,
                    }
                    : {});
            });
            describe('for other user', () => {
                specHelper_1.default.withStrike();
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.post(`${config_1.default.baseUrl}/strikes/${this.strike._id}/${newState}`, {}, { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } });
                }, 403);
            });
            describe('for unauthorized', () => {
                specHelper_1.default.withStrike();
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.post(`${config_1.default.baseUrl}/strikes/${this.strike._id}/${newState}`, {});
                }, 401);
            });
        };
        describe('Revoke', () => {
            describe('valid flow', () => {
                createTest('revoke', undefined, false, true);
            });
            describe('invalid flow', () => {
                createTest('revoke', strike_1.StrikeState.Confirmed, true);
            });
        });
        describe('Confirm', () => {
            describe('valid flow', () => {
                createTest('confirm');
            });
            describe('invalid flow', () => {
                createTest('confirm', strike_1.StrikeState.Revoked, true);
            });
        });
    });
});
//# sourceMappingURL=strike.spec.js.map