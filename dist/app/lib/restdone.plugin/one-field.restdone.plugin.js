"use strict";
/**
 * Created by mk on 02/07/16.
 */
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
const app_1 = __importDefault(require("app"));
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const { consts: { RULES: { MANDATORY_PARAM_IS_MISSING, }, }, } = app_1.default;
function restdoneFn(restdoneController, options) {
    const { field, path = field, idFieldName = '_id', pre, } = options;
    if (!field) {
        throw new Error('Field is required');
    }
    if (!path) {
        throw new Error('Path is required');
    }
    const action = {
        method: 'put',
        path: `:${idFieldName}/${path}`,
        handler(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const newValue = scope.body[field];
                if (!newValue) {
                    throw createAppError_1.default(MANDATORY_PARAM_IS_MISSING, field);
                }
                const doc = yield this.locateModel(scope);
                doc[field] = newValue;
                yield doc.save();
                return undefined;
            });
        },
    };
    if (pre) {
        action.pre = pre;
    }
    restdoneController.actions[`${path}`] = restdoneController.normalizeAction(action, `${path}`);
}
const plugin = {
    restdone: restdoneFn,
};
exports.default = plugin;
//# sourceMappingURL=one-field.restdone.plugin.js.map