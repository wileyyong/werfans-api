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
const http_status_node_1 = __importDefault(require("http-status-node"));
function restdoneFn(restdoneController, options) {
    const { field, path = field, idFieldName = '_id', pre, model, extraFieldNames = '', afterInc, } = options;
    if (!field) {
        throw new Error('"field" is required');
    }
    if (!model) {
        throw new Error('"model" is required');
    }
    if (!path) {
        throw new Error('"path" is required');
    }
    const action = {
        method: 'post',
        path: `:${idFieldName}/inc/${path}`,
        handler(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const doc = yield model
                    .findOneAndUpdate({ [idFieldName]: scope.params[idFieldName] }, { $inc: { [field]: 1 } }, { new: true })
                    .select(`email ${extraFieldNames}`)
                    .lean();
                if (!doc) {
                    throw http_status_node_1.default.NOT_FOUND.createError();
                }
                if (afterInc) {
                    yield afterInc(scope, doc);
                }
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
//# sourceMappingURL=inc-field.restdone.plugin.js.map