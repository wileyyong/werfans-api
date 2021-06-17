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
const chai_1 = require("chai");
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { consts: { events }, modelProvider: { User }, } = app_1.default;
describe('Album Purchase', () => {
    specHelper_1.default.withUser({
        key: 'user',
    });
    specHelper_1.default.withUser({
        key: 'ownerUser',
    });
    specHelper_1.default.withAlbum({
        userKey: 'ownerUser',
        extraData: { price: 12 },
    });
    describe('enough balance', () => {
        specHelper_1.default.resetUserBalance(13);
        specHelper_1.default.checkMoleculerEventEmit(events.payment.accepted, true, {
            mask: ['_id', 'owner', 'ref'],
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(`${config_1.default.baseUrl}/albums/${this.album._id}/purchase`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 200, {});
        it('balance should reduce', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { balance: userBalance } = yield User.findById(this.user._id).select('balance').lean();
                chai_1.expect(userBalance).to.be.equal(1);
            });
        });
    });
    describe('not enough balance', () => {
        specHelper_1.default.resetUserBalance(11);
        specHelper_1.default.checkMoleculerEventEmit(events.payment.accepted, false);
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(`${config_1.default.baseUrl}/albums/${this.album._id}/purchase`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
        }, 400);
        it('balance should not change', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const { balance: userBalance } = yield User.findById(this.user._id).select('balance').lean();
                chai_1.expect(userBalance).to.be.equal(11);
            });
        });
    });
});
//# sourceMappingURL=album-purchase.spec.js.map