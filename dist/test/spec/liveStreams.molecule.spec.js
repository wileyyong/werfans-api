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
const moment_1 = __importDefault(require("moment"));
const app_1 = __importDefault(require("app"));
const chai_1 = require("chai");
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { modelProvider: { LiveStream, Notification }, moleculerBroker, moleculerService } = app_1.default;
function fetchLiveStream(liveStreamId) {
    return LiveStream
        .findById(liveStreamId)
        .select('startingProcessedAt')
        .lean();
}
function updateLiveStream(liveStreamId, scheduledStartingAt) {
    return LiveStream
        .updateOne({
        _id: liveStreamId,
    }, {
        scheduledStartingAt,
    });
}
describe('liveStreams Molecule', () => {
    before(() => moleculerService.startBrokerWithServices(['liveStreams']));
    after(() => moleculerService.stopBroker());
    specHelper_1.default.withUser({
        key: 'user',
        seed: 1,
    });
    specHelper_1.default.withUser({
        key: 'subscriberUser',
        seed: 2,
    });
    specHelper_1.default.withUser({
        key: 'notSubscriberUser',
        seed: 3,
    });
    before(function () {
        return specHelper_1.default.addUserSubscribers(this.user, this.subscriberUser);
    });
    describe('#checkScheduled', () => {
        describe('not scheduled liveStream', () => {
            let liveStream;
            specHelper_1.default.withLiveStream({
                seed: 1,
            });
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    yield moleculerBroker.getLocalService('liveStreams').checkScheduled();
                    liveStream = yield fetchLiveStream(this.liveStream._id);
                });
            });
            it('should not set startingProcessedAt', () => chai_1.expect(liveStream.startingProcessedAt).to.be.undefined);
        });
        describe('scheduled in the past liveStream', () => {
            let liveStream;
            let notifications;
            specHelper_1.default.withLiveStream({
                seed: 1,
            });
            before(() => specHelper_1.default.removeAllNotifications());
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const scheduledStartingAt = moment_1.default().subtract(2, 'hours').toISOString();
                    yield updateLiveStream(this.liveStream._id, scheduledStartingAt);
                    yield moleculerBroker.getLocalService('liveStreams').checkScheduled();
                    liveStream = yield fetchLiveStream(this.liveStream._id);
                });
            });
            before(() => __awaiter(void 0, void 0, void 0, function* () {
                notifications = yield Notification.find().lean();
            }));
            after(() => specHelper_1.default.removeAllNotifications());
            it('should set startingProcessedAt', () => chai_1.expect(liveStream.startingProcessedAt).not.to.be.undefined);
            it('should create notification', function () {
                return specHelper_1.default.maskPaths(notifications, [
                    '_id',
                    'createdAt',
                    'updatedAt',
                    'recipients[0]',
                    'unread[0]',
                    'metadata.liveStream',
                    'metadata.owner',
                ]).should.matchSnapshot(this);
            });
        });
        describe('scheduled in the future liveStream', () => {
            let liveStream;
            specHelper_1.default.withLiveStream({
                seed: 1,
            });
            before(function () {
                return __awaiter(this, void 0, void 0, function* () {
                    const scheduledStartingAt = moment_1.default().add(2, 'hours').toISOString();
                    yield updateLiveStream(this.liveStream._id, scheduledStartingAt);
                    yield moleculerBroker.getLocalService('liveStreams').checkScheduled();
                    liveStream = yield fetchLiveStream(this.liveStream._id);
                });
            });
            it('should not set startingProcessedAt', () => chai_1.expect(liveStream.startingProcessedAt).to.be.undefined);
        });
    });
});
//# sourceMappingURL=liveStreams.molecule.spec.js.map