"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelName = 'Reward';
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     RewardModel:
 *       type: object
 *       properties:
 *         reward:
 *           type: string
 *         description:
 *           type: string
 *         period:
 *           type: string
 *         place:
 *           type: integer
 *           enum:
 *             - 1
 *             - 2
 *             - 3
 *             - 4
 *             - 5
 *             - 6
 *             - 7
 *             - 8
 *             - 9
 *             - 10
 *     RewardModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         reward:
 *           type: string
 *         description:
 *           type: string
 *         period:
 *           type: string
 *         place:
 *           type: integer
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        reward: {
            type: String,
            required: true,
        },
        description: String,
        period: String,
        place: {
            type: Number,
            min: 1,
            max: 10,
        },
    }, {
        timestamps: true,
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=reward.model.js.map