"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const mongoose_validator_1 = __importDefault(require("mongoose-validator"));
const modelName = 'Report';
const urlValidator = mongoose_validator_1.default({
    validator: 'isURL',
    message: '{PATH} must be URL',
});
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     ReportModel:
 *       type: object
 *       properties:
 *         author:
 *           type: string
 *         complainUser:
 *           type: string
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *     ReportModelResponse:
 *       type: object
 *       properties:
 *         author:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *         complainUser:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *         body:
 *           type: string
 *         photoUrl:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        author: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        complainUser: {
            type: mongoose.Schema.Types.ObjectId,
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
    }, {
        timestamps: true,
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=report.model.js.map