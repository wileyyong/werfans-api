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
const modelName = 'Album';
const urlValidator = mongoose_validator_1.default({
    validator: 'isURL',
    message: '{PATH} must be URL',
});
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     AlbumModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *     AlbumModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         photosCounter:
 *           type: integer
 *         viewsCounter:
 *           type: integer
 *         owner:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     AlbumModelResponseList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         name:
 *           type: string
 *         coverUrl:
 *           type: string
 *         price:
 *           type: integer
 *         photosCounter:
 *           type: integer
 *         viewsCounter:
 *           type: integer
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        name: {
            type: String,
            required: true,
        },
        coverUrl: {
            type: String,
            validate: urlValidator,
        },
        price: {
            type: Number,
            required: true,
        },
        photosCounter: {
            type: Number,
            default: 0,
        },
        viewsCounter: {
            type: Number,
            default: 0,
        },
        owner: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
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
    schema.statics.findFavoriteAlbumsForUser = function findFavoriteAlbumsForUser(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const query = { favoritedUsers: { $in: [userId] } };
            const albums = yield mongoose.model('Album').find(query).lean();
            return albums;
        });
    };
    schema.statics.incPhotoCounter = function incPhotoCounter(id, value) {
        return __awaiter(this, void 0, void 0, function* () {
            return this
                .updateOne({ _id: id }, { $inc: { photosCounter: value } });
        });
    };
    schema.plugin(array_with_counter_restdone_plugin_1.default.mongoose, {
        array: {
            path: 'favoritedUsers',
            options: [{
                    ref: 'User',
                }],
        },
        mongoose,
    });
    /**
     * suspendedAt: Date,
     */
    schema.plugin(banContent_restdone_plugin_1.default.mongoose);
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=album.model.js.map