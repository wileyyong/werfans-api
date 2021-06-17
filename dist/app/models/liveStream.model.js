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
const mongoose_1 = require("mongoose");
const mongoose_validator_1 = __importDefault(require("mongoose-validator"));
const array_with_counter_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/array-with-counter.restdone.plugin"));
const liveStream_1 = require("../domains/liveStream");
const modelName = 'LiveStream';
const urlValidator = mongoose_validator_1.default({
    validator: 'isURL',
    message: '{PATH} must be URL',
});
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     LiveStreamModel:
 *       type: object
 *       properties:
 *         duration:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *     LiveStreamModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         duration:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *         likedUsersCounter:
 *           type: integer
 *         viewersCounter:
 *           type: integer
 *         likedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               username:
 *                 type: string
 *         viewsCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         owner:
 *           type: string
 *         state:
 *           type: string
 *           enum:
 *             - created
 *             - scheduled
 *             - onAir
 *             - completed
 *     LiveStreamModelResponseList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         duration:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         state:
 *           type: string
 *           enum:
 *             - created
 *             - scheduled
 *             - onAir
 *             - completed
 *         likedUsersCounter:
 *           type: integer
 *         viewersCounter:
 *           type: integer
 *         likedUsers:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               _id:
 *                 type: string
 *               username:
 *                 type: string
 *         favoritedUsers:
 *           type: array
 *           items: string
 *         favoritedUsersCounter:
 *           type: integer
 *         viewsCounter:
 *           type: integer
 *         scheduledStartingAt:
 *           type: string
 *         scheduledAt:
 *           type: string
 *         startedAt:
 *           type: string
 *         stoppedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        duration: {
            type: Number,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        coverUrl: {
            type: String,
            validate: urlValidator,
        },
        url: {
            type: String,
            validate: urlValidator,
        },
        publicUrl: {
            type: String,
            validate: urlValidator,
        },
        owner: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        state: {
            type: String,
            enum: liveStream_1.LiveStreamStateValues,
            default: liveStream_1.LiveStreamState.Created,
        },
        viewsCounter: {
            type: Number,
            default: 0,
        },
        startingProcessedAt: Date,
        scheduledStartingAt: Date,
        scheduledAt: Date,
        startedAt: Date,
        stoppedAt: Date,
    }, {
        timestamps: true,
    });
    schema.methods.changeState = function changeState(newState) {
        const liveStream = this;
        const { state: currentState } = liveStream;
        if ((currentState === liveStream_1.LiveStreamState.Created && newState === liveStream_1.LiveStreamState.Scheduled)
            || (currentState === liveStream_1.LiveStreamState.Created && newState === liveStream_1.LiveStreamState.OnAir)
            || (currentState === liveStream_1.LiveStreamState.Scheduled && newState === liveStream_1.LiveStreamState.OnAir)
            || (currentState === liveStream_1.LiveStreamState.OnAir && newState === liveStream_1.LiveStreamState.Completed)) {
            liveStream.state = newState;
            return true;
        }
        else {
            return false;
        }
    };
    schema.plugin(array_with_counter_restdone_plugin_1.default.mongoose, {
        array: {
            path: 'likedUsers',
            options: [{
                    ref: 'User',
                }],
        },
        mongoose,
    });
    schema.plugin(array_with_counter_restdone_plugin_1.default.mongoose, {
        array: {
            path: 'favoritedUsers',
            options: [{
                    ref: 'User',
                }],
        },
        mongoose,
    });
    schema.statics.findFavoriteLiveStreamsForUser = function findFavoriteLiveStreamsForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { favoritedUsers: { $in: [userId] } };
            const liveStreams = yield mongoose.model('LiveStream').find(query).lean();
            return liveStreams;
        });
    };
    schema.plugin(array_with_counter_restdone_plugin_1.default.mongoose, {
        array: {
            path: 'viewers',
            options: [{
                    ref: 'User',
                }],
        },
        mongoose,
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=liveStream.model.js.map