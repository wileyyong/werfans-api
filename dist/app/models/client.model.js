"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelName = 'Client';
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        name: {
            type: String,
            unique: true,
            required: true,
        },
        clientId: {
            type: String,
            unique: true,
            required: true,
        },
        clientSecret: {
            type: String,
            required: true,
        },
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=client.model.js.map