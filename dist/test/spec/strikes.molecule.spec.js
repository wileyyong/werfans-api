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
const { consts: { events }, modelProvider: { Notification }, moleculerBroker, moleculerService, } = app_1.default;
describe('strikes Molecule', () => {
    before(() => moleculerService.startBrokerWithServices(['strikes']));
    after(() => moleculerService.stopBroker());
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser();
    specHelper_1.default.withStrike();
    describe('on strike.created', () => {
        let notifications;
        before(() => specHelper_1.default.removeAllNotifications());
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                yield specHelper_1.default.callMoleculerEventHandler(moleculerBroker.getLocalService('strikes'), events.strikes.created, {
                    _id: this.strike._id,
                    targetUser: this.user._id,
                });
                notifications = yield Notification.find().lean();
            });
        });
        after(() => specHelper_1.default.removeAllNotifications());
        it('should create notification', function () {
            chai_1.expect(notifications.length).to.be.equal(1);
            return specHelper_1.default.maskPaths(notifications, [
                '_id',
                'createdAt',
                'updatedAt',
                'recipients[0]',
                'unread[0]',
                'metadata.strike',
            ]).should.matchSnapshot(this);
        });
    });
});
//# sourceMappingURL=strikes.molecule.spec.js.map