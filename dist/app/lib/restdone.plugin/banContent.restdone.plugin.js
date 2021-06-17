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
const app_1 = __importDefault(require("app"));
const ban_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/ban.restdone.plugin"));
const validateSchema_1 = __importDefault(require("../validateSchema"));
function mongooseFn(schema) {
    return ban_restdone_plugin_1.default.mongoose(schema, {
        extraUnbanValues: { $unset: { suspendedAt: '', banningReasonType: '', banningReasonDescription: '' } },
    });
}
function restdoneFn(restdoneController, options) {
    const { Model, targetUserFieldName = 'owner', } = options;
    const { consts: { events }, modelProvider: { Strike }, schemas: { banContentSchema }, } = app_1.default;
    return ban_restdone_plugin_1.default.restdone(restdoneController, {
        Model,
        afterBan(doc, scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const freshDoc = yield Model.findById(doc._id).lean();
                if (freshDoc) {
                    const strike = yield Strike.create({
                        creator: scope.user._id,
                        ref: freshDoc._id,
                        refModel: Model.modelName,
                    });
                    app_1.default.moleculerBroker.emit(events.strikes.created, {
                        _id: strike.id,
                        targetUser: strike.targetUser,
                    });
                }
            });
        },
        exposeUnban: false,
        getExtraBanValues(scope) {
            return __awaiter(this, void 0, void 0, function* () {
                const { body } = scope;
                const { banningReasonType, banningReasonDescription, } = yield validateSchema_1.default(body, banContentSchema);
                return { banningReasonType, banningReasonDescription };
            });
        },
    });
}
const plugin = {
    mongoose: mongooseFn,
    restdone: restdoneFn,
};
exports.default = plugin;
//# sourceMappingURL=banContent.restdone.plugin.js.map