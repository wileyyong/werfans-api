"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelName = 'RefreshToken';
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        user: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'User',
            required: true,
        },
        client: {
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Client',
            required: true,
        },
        token: {
            type: String,
            unique: true,
            required: true,
        },
        createdAt: {
            type: Date,
            default: Date.now,
        },
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=refreshToken.model.js.map