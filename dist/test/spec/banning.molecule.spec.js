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
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const strike_1 = require("../../app/domains/strike");
const banning_1 = require("../../app/domains/banning");
const { config: { banningStrategy: { strikeThreshold } }, consts: { events }, moleculerBroker, moleculerService, modelProvider: { Album, Strike, User, }, } = app_1.default;
describe('banning Molecule', () => {
    describe('on strike.created', () => {
        specHelper_1.default.withAdminUser();
        specHelper_1.default.withUser({
            key: 'otherUser',
        });
        specHelper_1.default.withStrike({
            targetUserKey: 'otherUser',
        });
        const prepareUser = (strikeNumber) => {
            specHelper_1.default.withUser();
            for (let i = 0; i < strikeNumber; i += 1) {
                specHelper_1.default.withStrike();
            }
        };
        const checkBan = function (shouldBan) {
            it(shouldBan ? 'should ban' : 'should not ban', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const user = yield User.findById(this.user._id);
                    return shouldBan
                        ? chai_1.expect(user.suspendedAt).not.to.be.undefined
                            && chai_1.expect(user.banningReasonType).to.be.equal(banning_1.BanningReasonType.ByStrikes)
                        : chai_1.expect(user.suspendedAt).to.be.undefined
                            && chai_1.expect(user.banningReasonType).to.be.undefined;
                });
            });
        };
        const callEventHandler = () => {
            before(() => moleculerService.startBrokerWithServices(['banning']));
            after(() => moleculerService.stopBroker());
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('banning'), events.strikes.created, {
                        _id: this.strike._id,
                        targetUser: this.user._id,
                    });
                });
            });
        };
        describe('not enough strikes', () => {
            prepareUser(strikeThreshold - 1);
            callEventHandler();
            checkBan(false);
        });
        describe('not enough strikes in right state', () => {
            prepareUser(strikeThreshold);
            before('make last strike revoked', function () {
                return Strike.updateOne({ _id: this.strike._id }, { state: strike_1.StrikeState.Revoked });
            });
            callEventHandler();
            checkBan(false);
        });
        describe('enough strikes', () => {
            prepareUser(strikeThreshold);
            callEventHandler();
            checkBan(true);
        });
        describe('extra strikes in right state', () => {
            prepareUser(strikeThreshold + 1);
            callEventHandler();
            checkBan(true);
        });
    });
    describe('on strike.revoked', () => {
        specHelper_1.default.withAdminUser();
        specHelper_1.default.withUser({
            key: 'otherUser',
        });
        specHelper_1.default.withStrike({
            targetUserKey: 'otherUser',
        });
        const prepareUser = (strikeNumber, banningReasonType) => {
            specHelper_1.default.withUser();
            for (let i = 0; i < strikeNumber; i += 1) {
                specHelper_1.default.withAlbum({
                    key: `album${i}`,
                });
                before(function () {
                    return __awaiter(this, void 0, void 0, function* () {
                        yield specHelper_1.default.banAlbum(this.adminUser, this[`album${i}`]);
                        if (i === strikeNumber - 1) {
                            this.strike = yield Strike.findOne({ ref: this[`album${i}`]._id }).lean();
                            this.album = this[`album${i}`];
                        }
                    });
                });
            }
            if (banningReasonType) {
                before(function () {
                    return User.ban(this.user._id, { banningReasonType });
                });
            }
        };
        const checkUserBan = function (shouldBan) {
            it(shouldBan ? 'should keep user banned' : 'should unban user', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const user = yield User.findById(this.user._id);
                    return shouldBan
                        ? chai_1.expect(user.suspendedAt).not.to.be.undefined
                        : chai_1.expect(user.suspendedAt).to.be.undefined;
                });
            });
        };
        const checkAlbumBan = function (shouldBan) {
            it(shouldBan ? 'album should keep ban' : 'album should unban', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const album = yield Album.findById(this.album._id);
                    return shouldBan
                        ? chai_1.expect(album.suspendedAt).not.to.be.undefined
                        : chai_1.expect(album.suspendedAt).to.be.undefined;
                });
            });
        };
        const callEventHandler = () => {
            before(() => moleculerService.startBrokerWithServices(['banning']));
            after(() => moleculerService.stopBroker());
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('banning'), events.strikes.revoked, {
                        _id: this.strike._id,
                        targetUser: this.user._id,
                        ref: this.album._id,
                        refModel: strike_1.StrikeTargetModel.Album,
                    });
                });
            });
        };
        describe('1 strike', () => {
            prepareUser(1, banning_1.BanningReasonType.ByStrikes);
            callEventHandler();
            checkAlbumBan(false);
            checkUserBan(false);
        });
        describe('lower strikeThreshold', () => {
            describe('ByStrikes', () => {
                prepareUser(strikeThreshold - 1, banning_1.BanningReasonType.ByStrikes);
                callEventHandler();
                checkAlbumBan(false);
                checkUserBan(false);
            });
            describe('ByAdmin', () => {
                prepareUser(strikeThreshold - 1, banning_1.BanningReasonType.ByAdmin);
                callEventHandler();
                checkAlbumBan(false);
                checkUserBan(true);
            });
        });
        describe('still a lot of strikes', () => {
            prepareUser(strikeThreshold, banning_1.BanningReasonType.ByStrikes);
            callEventHandler();
            checkAlbumBan(false);
            checkUserBan(true);
        });
    });
});
//# sourceMappingURL=banning.molecule.spec.js.map