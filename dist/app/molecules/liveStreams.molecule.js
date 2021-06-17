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
// @ts-ignore
const moleculer_cron_1 = __importDefault(require("moleculer-cron"));
const app_1 = __importDefault(require("app"));
const notification_1 = require("../domains/notification");
const { config: { isMigration, isTest }, modelProvider: { LiveStream, User } } = app_1.default;
exports.default = () => {
    const LiveStreamsService = {
        name: 'liveStreams',
        mixins: [moleculer_cron_1.default],
        crons: [
            {
                name: 'CheckScheduledLiveStreams',
                cronTime: '* * * * *',
                manualStart: isMigration || isTest,
                onTick() {
                    return this.getLocalService('liveStreams').checkScheduled();
                },
            },
        ],
        methods: {
            checkScheduled() {
                return __awaiter(this, void 0, void 0, function* () {
                    const currentDate = new Date();
                    yield LiveStream
                        .updateMany({
                        scheduledStartingAt: { $lte: currentDate },
                        startingProcessedAt: { $exists: false },
                    }, {
                        startingProcessedAt: new Date(currentDate).getTime(),
                    });
                    // fetch just updated
                    const liveStreamList = yield LiveStream
                        .find({ startingProcessedAt: new Date(currentDate).getTime() })
                        .select('_id owner')
                        .lean();
                    yield Promise.all(liveStreamList.map(({ _id: liveStreamId, owner }) => __awaiter(this, void 0, void 0, function* () {
                        const recipients = yield User.getSubscribersOf(owner);
                        yield app_1.default.notificationService.createNotification({
                            notificationType: notification_1.NotificationType.LiveStreamStarting,
                            body: 'LiveStream is starting',
                            metadata: {
                                liveStream: liveStreamId,
                                owner,
                            },
                            recipients,
                        });
                    })));
                });
            },
        },
    };
    return LiveStreamsService;
};
//# sourceMappingURL=liveStreams.molecule.js.map