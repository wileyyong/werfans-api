"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const morgan_1 = __importDefault(require("morgan"));
const chalk_1 = __importDefault(require("chalk"));
exports.default = (expressApp, { config }) => {
    if (config.isProduction || config.logger.suppressStdout) {
        return;
    }
    const detailedLogging = config.logger.level !== 'warn' && config.logger.level !== 'error';
    // Enable logger (morgan)
    morgan_1.default.token('resdata', (req, res) => {
        const status = res.statusCode;
        let color = 'green';
        if (status >= 500) {
            color = 'red';
        }
        else if (status >= 400) {
            color = 'yellow';
        }
        else if (status >= 300) {
            color = 'cyan';
        }
        if (detailedLogging && res.statusCode !== 404) {
            const body = req.body ? JSON.stringify(req.body, null, 2) : '';
            let result;
            if (res.restfulResult) {
                result = JSON.stringify(res.restfulResult, null, 2);
            }
            else if (res.controldoneResult) {
                result = JSON.stringify(res.controldoneResult, null, 2);
            }
            else {
                result = res.statusMessage;
            }
            return chalk_1.default[color](`\n-> ${body}\n<- ${result}`);
        }
        else {
            return '';
        }
    });
    expressApp.use(morgan_1.default(':method :url :status :response-time ms - :res[content-length] :resdata'));
};
//# sourceMappingURL=0050-debug-logger.middleware.js.map