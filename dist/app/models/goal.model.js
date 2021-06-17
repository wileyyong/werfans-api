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
const http_status_node_1 = __importDefault(require("http-status-node"));
const mongoose_1 = require("mongoose");
const goal_1 = require("../domains/goal");
const modelName = 'Goal';
/**
 * @swagger
 * components:
 *   schemas:
 *     GoalModel:
 *       type: object
 *       properties:
 *         title:
 *           type: string
 *         targetAmount:
 *           type: integer
 *         currentAmount:
 *           type: integer
 *         state:
 *           type: string
 *           enum:
 *             - active
 *             - completed
 *             - cancelled
 *         completedAt:
 *           type: string
 *     GoalModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           type: string
 *         title:
 *           type: string
 *         targetAmount:
 *           type: integer
 *         currentAmount:
 *           type: integer
 *         state:
 *           type: string
 *         completedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     GoalModelResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         title:
 *           type: string
 *         targetAmount:
 *           type: integer
 *         currentAmount:
 *           type: integer
 *         state:
 *           type: string
 *         completedAt:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 */
module.exports = (mongoose) => {
    const schema = new mongoose_1.Schema({
        liveStream: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'LiveStream',
        },
        owner: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
        },
        title: String,
        targetAmount: {
            type: Number,
            required: true,
        },
        currentAmount: {
            type: Number,
            default: 0,
        },
        completedAt: {
            type: Date,
            default: null,
        },
        state: {
            type: String,
            required: true,
            enum: goal_1.GoalStateValues,
            default: goal_1.GoalState.Active,
        },
    }, {
        timestamps: true,
    });
    schema.methods.changeState = function changeState(newState) {
        const goal = this;
        const { state: currentState } = goal;
        if ((currentState === goal_1.GoalState.Active && newState === goal_1.GoalState.Cancelled)
            || (currentState === goal_1.GoalState.Active && newState === goal_1.GoalState.Reached)) {
            goal.state = newState;
            return true;
        }
        else {
            return false;
        }
    };
    schema.methods.updateState = function updateState(goalId, state) {
        return __awaiter(this, void 0, void 0, function* () {
            const goal = this;
            if (goal.changeState(state)) {
                if (state === goal_1.GoalState.Reached) {
                    goal.completedAt = new Date();
                }
                return goal;
            }
            else {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
        });
    };
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=goal.model.js.map