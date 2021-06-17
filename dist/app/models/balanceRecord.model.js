"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const balanceRecord_1 = require("../domains/balanceRecord");
const balanceRecordRefModel_1 = require("../domains/balanceRecordRefModel");
const modelName = 'BalanceRecord';
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     BalanceRecordResponse:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         owner:
 *           type: string
 *         type:
 *           type: string
 *           enum:
 *             - LoadBalance
 *             - PurchaseContent
 *             - SendTips
 *         sum:
 *           type: number
 *         ref:
 *           type: string
 *         refModel:
 *           type: string
 *           enum:
 *             - Album
 *             - Goal
 *             - LiveStream
 *             - Photo
 *             - Video
 *         createdAt:
 *           type: string
 */
module.exports = (mongoose) => {
    const schema = new mongoose_1.Schema({
        owner: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        type: {
            type: String,
            enum: balanceRecord_1.BalanceRecordTypeValues,
            required: true,
        },
        sum: {
            type: Number,
            required: true,
        },
        ref: {
            type: mongoose_1.Schema.Types.ObjectId,
            refPath: 'refModel',
        },
        refModel: {
            type: String,
            enum: balanceRecordRefModel_1.BalanceRecordRefModelValues,
        },
        processedAt: Date,
    }, {
        timestamps: {
            updatedAt: false,
        },
    });
    schema.statics.markProcessed = function markProcessed(id) {
        return this.updateOne({ _id: id }, { processedAt: new Date() });
    };
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=balanceRecord.model.js.map