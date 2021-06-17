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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelName = 'Review';
/**
 * @swagger
 * components:
 *   schemas:
 *     ReviewModel:
 *       type: object
 *       properties:
 *         author:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         body:
 *           type: string
 *     ReviewModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         targetUser:
 *           type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         body:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     ReviewModelResponse:
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
 *         targetUser:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *             username:
 *               type: string
 *         rating:
 *           type: integer
 *           minimum: 1
 *           maximum: 5
 *         body:
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
        targetUser: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
        },
        body: {
            type: String,
            required: true,
        },
    }, {
        timestamps: true,
    });
    schema.statics.calculateRating = function calculateRating(targetUser) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield this
                .aggregate()
                .match({ targetUser: mongoose_1.Types.ObjectId(targetUser) })
                .group({ _id: null, avgRating: { $avg: '$rating' } });
            return result[0].avgRating;
        });
    };
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=review.model.js.map