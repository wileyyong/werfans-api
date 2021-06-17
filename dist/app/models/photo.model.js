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
const banContent_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/banContent.restdone.plugin"));
const array_with_counter_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/array-with-counter.restdone.plugin"));
const strike_1 = require("../domains/strike");
const modelName = 'Photo';
const urlValidator = mongoose_validator_1.default({
    validator: 'isURL',
    message: '{PATH} must be URL',
});
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     PhotoModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isCover:
 *           type: string
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *           enum:
 *             - 0
 *             - 1
 *             - 2
 *             - 3
 *             - 4
 *             - 5
 *         blurIntensity:
 *           type: integer
 *           enum:
 *             - 0
 *             - 1
 *             - 2
 *             - 3
 *             - 4
 *             - 5
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *     PhotoModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         description:
 *           type: string
 *         isCover:
 *           type: string
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *         blurIntensity:
 *           type: integer
 *         url:
 *           type: string
 *         publicUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         viewsCounter:
 *           type: integer
 *         album:
 *           type: object
 *           $ref: '#/components/schemas/AlbumModelResponse'
 */
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        name: {
            type: String,
            required: true,
        },
        description: String,
        isCover: String,
        watermarkUrl: {
            type: String,
            validate: urlValidator,
        },
        watermarkOpacity: {
            type: Number,
            min: 0,
            max: 5,
        },
        blurIntensity: {
            type: Number,
            min: 0,
            max: 5,
        },
        url: {
            type: String,
            required: true,
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
        album: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Album',
            required: true,
        },
        viewsCounter: {
            type: Number,
            default: 0,
        },
        banningReasonType: {
            type: String,
            enum: strike_1.StrikeTypeValues,
        },
        banningReasonDescription: {
            type: String,
        },
    }, {
        timestamps: true,
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
    schema.statics.findFavoritePhotosForUser = function findFavoritePhotosForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { favoritedUsers: { $in: [userId] } };
            const photos = yield mongoose.model('Photo').find(query).lean();
            return photos;
        });
    };
    schema.pre('save', function preSave(next) {
        this.wasNew = this.isNew;
        next();
    });
    /**
     * suspendedAt: Date,
     */
    schema.plugin(banContent_restdone_plugin_1.default.mongoose);
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=photo.model.js.map