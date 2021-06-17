"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelName = 'UserConfig';
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     UserConfigModel:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         key:
 *           type: string
 *         data:
 *           type: object
 *     UserConfigModelResponse:
 *       type: object
 *       properties:
 *         user:
 *           type: string
 *         key:
 *           type: string
 *         data:
 *           type: object
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        key: {
            type: String,
            required: true,
        },
        data: {
            type: mongoose_1.Schema.Types.Mixed,
            required: true,
        },
    }, {
        timestamps: true,
    });
    schema.index({ user: 1, key: 1 }, { unique: true });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=userConfig.model.js.map