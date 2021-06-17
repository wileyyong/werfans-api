"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_validator_1 = __importDefault(require("mongoose-validator"));
const mongoose_1 = require("mongoose");
const feedback_1 = require("../domains/feedback");
const urlValidator = mongoose_validator_1.default({
    validator: 'isURL',
    message: '{PATH} must be URL',
});
const modelName = 'Feedback';
/**
 * @swagger
 * components:
 *   schemas:
 *     FeedbackModel:
 *       type: object
 *       properties:
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - suggestion
 *             - supportRequest
 *     FeedbackModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         type:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     FeedbackModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         type:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
module.exports = (mongoose) => {
    const schema = new mongoose_1.Schema({
        author: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
        photoUrl: {
            type: String,
            validate: urlValidator,
        },
        type: {
            type: String,
            required: true,
            enum: feedback_1.FeedbackTypeValues,
        },
    }, {
        timestamps: true,
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=feedback.model.js.map