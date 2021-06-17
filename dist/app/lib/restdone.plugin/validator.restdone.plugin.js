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
const validateSchema_1 = __importDefault(require("../validateSchema"));
function restdone(restdoneController) {
    const { actions } = restdoneController;
    Object.values(actions).forEach((action) => {
        const { handler: originalHandler = () => { }, bodySchema, validate } = action;
        action.handler = function handler(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                if (bodySchema) {
                    yield validateSchema_1.default(scope.body, bodySchema);
                }
                if (validate) {
                    yield validate.call(this, scope);
                }
                return originalHandler.call(this, scope);
            });
        };
    });
}
const plugin = {
    restdone,
};
exports.default = plugin;
//# sourceMappingURL=validator.restdone.plugin.js.map