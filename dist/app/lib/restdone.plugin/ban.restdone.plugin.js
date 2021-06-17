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
function mongooseFn(schema, options = {}) {
    const { fieldName = 'suspendedAt', extraBanValues, extraUnbanValues } = options;
    const fieldOpt = {
        [fieldName]: Date,
    };
    schema.add(fieldOpt);
    schema.statics.ban = function ban(id, extraValues = {}) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nModified } = yield this.updateOne({ _id: id }, Object.assign(Object.assign({ [fieldName]: new Date() }, extraBanValues), extraValues));
            return nModified > 0;
        });
    };
    schema.statics.unban = function unban(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const { nModified } = yield this.updateOne({ _id: id }, Object.assign({ $unset: { [fieldName]: '' } }, extraUnbanValues));
            return nModified > 0;
        });
    };
}
function restdoneFn(restdoneController, options) {
    const { Model, afterBan = () => __awaiter(this, void 0, void 0, function* () { }), afterUnban = () => __awaiter(this, void 0, void 0, function* () { }), exposeUnban = true, banPrecondition = () => __awaiter(this, void 0, void 0, function* () { return true; }), getExtraBanValues = () => Promise.resolve({}), } = options;
    if (!Model) {
        throw new Error('Model is not provided');
    }
    function pre(scope) {
        restdoneController.requireAdmin(scope);
    }
    restdoneController.actions.ban = restdoneController.normalizeAction({
        method: 'post',
        path: ':_id/ban',
        pre,
        handler: function handler(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { params: { _id: id } } = scope;
                const extraValues = yield getExtraBanValues(scope);
                const document = yield this.locateModel(scope);
                const preconditionResult = yield banPrecondition(document);
                if (preconditionResult) {
                    yield Model.ban(id, extraValues);
                    yield afterBan(document, scope);
                }
                return undefined;
            });
        },
    }, 'ban');
    if (exposeUnban) {
        restdoneController.actions.unban = restdoneController.normalizeAction({
            method: 'post',
            path: ':_id/unban',
            pre,
            handler: function banHandler(scope) {
                return __awaiter(this, void 0, void 0, function* () {
                    const { params: { _id: id } } = scope;
                    yield this.locateModel(scope);
                    yield Model.unban(id);
                    yield afterUnban(id, scope);
                    return undefined;
                });
            },
        }, 'unban');
    }
}
const plugin = {
    mongoose: mongooseFn,
    restdone: restdoneFn,
};
exports.default = plugin;
//# sourceMappingURL=ban.restdone.plugin.js.map