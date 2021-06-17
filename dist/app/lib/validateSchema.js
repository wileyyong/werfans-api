"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const http_status_node_1 = __importDefault(require("http-status-node"));
const ajvFactory_1 = __importDefault(require("./services/moleculer.service/validator/ajvFactory"));
const type = 'app';
const ajvValidator = ajvFactory_1.default();
module.exports = (value, schema, httpStatus = http_status_node_1.default.BAD_REQUEST) => {
    const isValid = ajvValidator.validate(schema, value);
    if (isValid) {
        return value;
    }
    // transforming to more generic way
    const details = ajvValidator.errors.reduce((result, { keyword: kind, dataPath: path, data: errValue, message }) => {
        result[path] = { kind, path, value: errValue, message };
        return result;
    }, {});
    throw httpStatus.createError(ajvValidator.errorsText(), { error: 'SchemaValidationError', type, details });
};
//# sourceMappingURL=validateSchema.js.map