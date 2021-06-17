"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const moleculer_1 = require("moleculer");
const ajvFactory_1 = __importDefault(require("./ajvFactory"));
const ROOT_AJV_KEYWORDS = ['properties', 'not', 'oneOf', 'anyOf', 'if', 'type'];
class AjvValidator extends moleculer_1.Validator {
    constructor(ajvValidator) {
        super();
        this.ajvValidator = ajvValidator;
        this.ajvValidator = ajvFactory_1.default();
    }
    compile(schema) {
        const isAjv = ROOT_AJV_KEYWORDS.some((keyword) => schema[keyword]);
        if (isAjv) {
            try {
                const validate = this.ajvValidator.compile(schema);
                return (params) => this.validate(params, validate);
            }
            catch (err) {
                // do nothing
            }
        }
        return super.compile(schema);
    }
    validate(params, validate) {
        const valid = validate(params);
        if (!valid) {
            throw new moleculer_1.Errors.ValidationError(this.ajvValidator.errorsText(validate.errors), '', validate.errors);
        }
        return true;
    }
}
exports.default = AjvValidator;
//# sourceMappingURL=validator.js.map