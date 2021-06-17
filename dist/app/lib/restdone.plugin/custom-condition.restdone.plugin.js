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
Object.defineProperty(exports, "__esModule", { value: true });
function restdoneFn(restdoneController, options) {
    const { methods = {}, path, prepare = () => __awaiter(this, void 0, void 0, function* () { }), name = path } = options;
    if (!path) {
        throw new Error('Path is required');
    }
    const action = Object.assign(Object.assign({}, methods), { method: 'get', path, priority: -1, handler(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                yield prepare.call(this, scope);
                return this.select(scope);
            });
        } });
    restdoneController.actions[name] = restdoneController.normalizeAction(action, name);
}
const plugin = {
    restdone: restdoneFn,
};
exports.default = plugin;
//# sourceMappingURL=custom-condition.restdone.plugin.js.map