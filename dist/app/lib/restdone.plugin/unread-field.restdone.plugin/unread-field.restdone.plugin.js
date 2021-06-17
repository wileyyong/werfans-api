'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
/**
 * Created by mk on 02/07/16.
 */
const _ = require('lodash');
function restdone(restdoneController, options) {
    options = _.merge({
        Model: undefined,
        fieldName: 'unread',
        path: undefined,
    }, options || {});
    const { fieldName, Model, afterRemove, afterRemoveAll, } = options;
    if (!Model) {
        throw new Error('Model is not provided');
    }
    const path = options.path || fieldName;
    restdoneController.actions[`${fieldName}Remove`] = restdoneController.normalizeAction({
        method: 'delete',
        path: `:_id/${path}`,
        priority: -1,
        handler(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params: { _id }, user: { _id: userId } } = scope;
                yield Model.updateOne({ _id }, { $pull: { [fieldName]: userId } });
                if (_.isFunction(afterRemove)) {
                    yield afterRemove(scope);
                }
                return undefined;
            });
        },
    }, `${fieldName}Remove`);
    restdoneController.actions[`${fieldName}RemoveAll`] = restdoneController.normalizeAction({
        method: 'delete',
        path: `${path}`,
        priority: -1,
        handler(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params, user: { _id: userId } } = scope;
                yield Model.updateMany(params, { $pull: { [fieldName]: userId } }, { multi: true });
                if (_.isFunction(afterRemoveAll)) {
                    yield afterRemoveAll(scope);
                }
                return undefined;
            });
        },
    }, `${fieldName}RemoveAll`);
}
module.exports.restdone = restdone;
//# sourceMappingURL=unread-field.restdone.plugin.js.map