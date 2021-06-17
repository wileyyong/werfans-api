"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_validator_1 = __importDefault(require("mongoose-validator"));
const banContent_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/banContent.restdone.plugin"));
const strike_1 = require("../domains/strike");
const modelName = 'Video';
const urlValidator = mongoose_validator_1.default({
    validator: 'isURL',
    message: '{PATH} must be URL',
});
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     VideoModel:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         duration:
 *           type: integer
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
 *         coverUrl:
 *           type: string
 *         url:
 *           type: string
 *           required: true
 *         publicUrl:
 *           type: string
 *     VideoModelResponseCreated:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         duration:
 *           type: integer
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         url:
 *           type: string
 *           required: true
 *         publicUrl:
 *           type: string
 *         viewsCounter:
 *           type: integer
 *         commentsCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *         owner:
 *           type: string
 *     VideoModelResponseList:
 *       type: object
 *       properties:
 *         name:
 *           type: string
 *           required: true
 *         description:
 *           type: string
 *         price:
 *           type: integer
 *         duration:
 *           type: integer
 *         watermarkUrl:
 *           type: string
 *         watermarkOpacity:
 *           type: integer
 *         coverUrl:
 *           type: string
 *         url:
 *           type: string
 *           required: true
 *         publicUrl:
 *           type: string
 *         viewsCounter:
 *           type: integer
 *         commentsCounter:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 */
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        name: {
            type: String,
            required: true,
        },
        description: String,
        price: Number,
        duration: Number,
        watermarkUrl: {
            type: String,
            validate: urlValidator,
        },
        watermarkOpacity: {
            type: Number,
            min: 0,
            max: 5,
        },
        coverUrl: {
            type: String,
            validate: urlValidator,
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
        viewsCounter: {
            type: Number,
            default: 0,
        },
        commentsCounter: {
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
    /**
     * suspendedAt: Date,
     */
    schema.plugin(banContent_restdone_plugin_1.default.mongoose);
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=video.model.js.map