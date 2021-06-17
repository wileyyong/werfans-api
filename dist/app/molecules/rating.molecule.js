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
const moleculer_bee_queue_1 = __importDefault(require("moleculer-bee-queue"));
const app_1 = __importDefault(require("app"));
const QUEUE_NAME = 'rating.update';
const { config: { redis }, modelProvider: { Review, User } } = app_1.default;
exports.default = () => {
    const RatingService = {
        name: 'rating',
        mixins: [moleculer_bee_queue_1.default({ redis })],
        settings: {},
        actions: {
            update: {
                params: {
                    properties: {
                        targetUser: { type: 'string' },
                    },
                },
                handler(ctx) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const job = this.createJob(QUEUE_NAME, ctx.params);
                        this.logger.info(`Rating job for ${job.data.targetUser} created`);
                        yield job.retries(2).save();
                    });
                },
            },
        },
        queues: {
            [QUEUE_NAME](job) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { targetUser } = job.data;
                    try {
                        this.logger.info('Update rating for', targetUser);
                        const rating = yield Review.calculateRating(targetUser);
                        yield User.updateOne({ _id: targetUser }, { rating });
                    }
                    catch (err) {
                        this.logger.error('Cannot update rating for', targetUser);
                        this.logger.error(err);
                        throw err;
                    }
                });
            },
        },
        methods: {},
    };
    return RatingService;
};
//# sourceMappingURL=rating.molecule.js.map