"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const consolidate_1 = __importDefault(require("consolidate"));
exports.default = (expressApp) => {
    // Set up engine
    expressApp.engine('server.view.html', consolidate_1.default.swig);
    // Set views path and view engine
    expressApp.set('view engine', 'server.view.html');
    expressApp.set('views', './app/views');
};
//# sourceMappingURL=0045-init-view-engine.middleware.js.map