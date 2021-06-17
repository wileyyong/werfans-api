"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const modelName = 'Migration';
exports.default = (mongoose) => {
    const schema = new mongoose_1.Schema({
        key: {
            type: String,
            required: true,
            unique: true,
        },
        migrations: [{
                title: {
                    type: String,
                    required: true,
                },
            }],
        pos: {
            type: Number,
            required: true,
        },
    }, {
        timestamps: true,
    });
    return mongoose.model(modelName, schema);
};
//# sourceMappingURL=migration.model.js.map