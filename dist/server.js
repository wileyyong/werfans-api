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
const bootstrap = require('config/bootstrap');
module.exports = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app_1.default.init();
        const log = app_1.default.createLog(module);
        const { config: { app: { title }, port } } = app_1.default;
        app_1.default.httpServer.listen(port);
        log.info(`"${title}" application started on port ${port}`);
        log.info('Running bootstrap script...');
        yield bootstrap(app_1.default);
        log.info('Bootstrap script completed');
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error(`Starting failed with error: ${err.message}`);
        // eslint-disable-next-line no-console
        console.error(err);
        process.exit(1);
    }
});
//# sourceMappingURL=server.js.map