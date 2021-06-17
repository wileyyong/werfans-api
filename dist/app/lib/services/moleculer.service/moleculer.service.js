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
exports.MoleculerService = void 0;
class MoleculerService {
    constructor() {
        this.moleculeServices = [];
        this.molecules = {};
    }
    init(app) {
        return __awaiter(this, void 0, void 0, function* () {
            app.registerProvider('moleculerService', this);
            const { isMigration, isTest } = app.config;
            const { moleculerBroker, molecules } = app;
            this.broker = moleculerBroker;
            this.moleculeServices = molecules.map((moleculeFactory) => moleculeFactory(app));
            if (!isMigration && !isTest) {
                yield this.startBrokerWithServices();
            }
        });
    }
    startBrokerWithServices(serviceNames) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.broker) {
                throw new Error('No broker defined');
            }
            const broker = this.broker;
            const moleculeServices = serviceNames
                ? this.moleculeServices.filter(({ name }) => serviceNames.includes(name))
                : this.moleculeServices;
            const services = yield Promise.all(moleculeServices.map((moleculeService) => broker.createService(moleculeService)));
            this.molecules = services.reduce((result, service) => {
                result[service.name] = service;
                return result;
            }, {});
            return broker.start();
        });
    }
    stopBroker() {
        return __awaiter(this, void 0, void 0, function* () {
            if (!this.broker) {
                throw new Error('No broker defined');
            }
            const broker = this.broker;
            yield Promise.all(broker.services.map((service) => broker.destroyService(service)));
            return broker.stop();
        });
    }
}
exports.MoleculerService = MoleculerService;
exports.default = new MoleculerService();
//# sourceMappingURL=moleculer.service.js.map