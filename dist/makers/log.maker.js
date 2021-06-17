"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
const path_1 = __importDefault(require("path"));
const createLogFactory = (app) => (module) => {
    let label;
    if (module) {
        const { filename } = module;
        label = filename
            ? filename.split(path_1.default.sep)
                .slice(-2)
                .join(path_1.default.sep)
            : `${module}`;
    }
    else {
        label = '';
    }
    try {
        return app.moleculerBroker.getLogger(label);
    }
    catch (err) {
        return console;
    }
};
module.exports = (app) => {
    const logFactory = createLogFactory(app);
    app.registerProvider('createLog', () => logFactory);
};
//# sourceMappingURL=log.maker.js.map