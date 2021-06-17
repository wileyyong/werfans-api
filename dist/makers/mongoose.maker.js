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
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("app"));
const health_service_1 = __importDefault(require("app/lib/services/health.service"));
const { config } = app_1.default;
const log = app_1.default.createLog(module);
const healthOk = function healthOk(name) {
    health_service_1.default.updateData(name, true, 'OK');
};
const healthProblem = function healthProblem(name, message) {
    health_service_1.default.updateData(name, false, message);
};
const initMongoose = (
// eslint-disable-next-line @typescript-eslint/no-shadow
app, mongoUrl, mongoConfig, models, providerName, name) => __awaiter(void 0, void 0, void 0, function* () {
    const mongoose = new mongoose_1.Mongoose();
    yield mongoose.connect(mongoUrl, Object.assign(Object.assign({}, mongoConfig), { useCreateIndex: true, useNewUrlParser: true }));
    log.info('Connected to DB');
    const db = mongoose.connection;
    db.on('error', (err) => {
        log.error('DB error', err);
        healthProblem(name, err.message);
    });
    db.on('disconnected', () => {
        log.error('DB disconnected');
        healthProblem(name, 'disconnected');
    });
    db.on('reconnected', () => {
        log.info('DB reconnected');
        healthOk(name);
    });
    healthOk(name);
    const modelProvider = new Proxy({}, {
        get(target, memberName) {
            if (!(memberName in target)) {
                return mongoose.model(memberName);
            }
            return target[memberName];
        },
    });
    // @ts-ignore
    app[models].forEach((modelModule) => {
        const modelFactory = modelModule;
        const model = modelFactory(mongoose);
        log.debug('registered model', model.modelName);
    });
    app.registerProvider(providerName, () => modelProvider);
    return mongoose;
});
module.exports = {
    // eslint-disable-next-line @typescript-eslint/no-shadow
    init(app) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                yield initMongoose(app, config.mongo, config.mongoOptions, 'models', 'modelProvider', 'db');
            }
            catch (err) {
                log.error('Cannot init mongoose', err);
                process.exit(1);
            }
        });
    },
    initMongoose,
};
//# sourceMappingURL=mongoose.maker.js.map