"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const strike_1 = require("../domains/strike");
const modelName = 'Strike';
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     StrikeModel:
 *       type: object
 *       properties:
 *         creator:
 *           type: string
 *         targetUser:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - abuse
 *             - nudity
 *             - spam
 *         description:
 *           type: string
 *         ref:
 *           type: string
 *         state:
 *           type: string
 *           enum:
 *             - created
 *             - confirmed
 *             - revoked
 *     StrikeModelResponseList:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         creator:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         targetUser:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         type:
 *           type: string
 *           enum:
 *             - abuse
 *             - nudity
 *             - spam
 *         description:
 *           type: string
 *         ref:
 *           type: string
 *         state:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 *     StrikeModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         creator:
 *           type: string
 *         targetUser:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - abuse
 *             - nudity
 *             - spam
 *         description:
 *           type: string
 *         state:
 *           type: string
 *         ref:
 *           type: string
 *         createdAt:
 *           type: string
 *           format: date
 *         updatedAt:
 *           type: string
 *           format: date
 */
module.exports = (mongoose) => {
    const schema = new mongoose_1.Schema({
        creator: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        targetUser: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            required: true,
            enum: strike_1.StrikeTypeValues,
        },
        description: {
            type: String,
        },
        ref: {
            type: mongoose_1.Schema.Types.ObjectId,
            refPath: 'refModel',
        },
        refModel: {
            type: String,
            enum: strike_1.StrikeTargetModelValues,
        },
        state: {
            type: String,
            enum: strike_1.StrikeStateValues,
            default: strike_1.StrikeState.Created,
        },
    }, {
        timestamps: true,
    });
    schema.methods.changeState = function changeState(newState) {
        const strike = this;
        const { state: currentState } = strike;
        if ((currentState === strike_1.StrikeState.Created && newState === strike_1.StrikeState.Confirmed)
            || (currentState === strike_1.StrikeState.Created && newState === strike_1.StrikeState.Revoked)) {
            strike.state = newState;
            return true;
        }
        else {
            return false;
        }
    };
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=strike.model.js.map