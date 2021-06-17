"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const comment_1 = require("../domains/comment");
const modelName = 'Comment';
/**
 * @swagger
 * components:
 *   schemas:
 *     CommentModel:
 *       type: object
 *       properties:
 *         body:
 *           type: string
 *     CommentModelResponseCreated:
 *       type: object
 *       properties:
 *         _id:
 *           type: string
 *         author:
 *           type: string
 *         target:
 *           type: string
 *         targetModel:
 *           type: string
 *         body:
 *           type: string
 *         createdAt:
 *           type: string
 *         updatedAt:
 *           type: string
 *     CommentModelResponse:
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
 *         target:
 *           type: string
 *         targetModel:
 *           type: string
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
        target: {
            type: mongoose_1.Schema.Types.ObjectId,
            refPath: 'targetModel',
            required: true,
        },
        targetModel: {
            type: String,
            required: true,
            enum: comment_1.CommentTargetValues,
        },
        body: {
            type: String,
            required: true,
        },
    }, {
        timestamps: true,
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=comment.model.js.map