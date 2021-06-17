"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
class HealthService {
    constructor() {
        this.data = {};
        this.failedStatuses = {};
    }
    getData() {
        return this.data;
    }
    isOk() {
        return lodash_1.default.keys(this.failedStatuses).length === 0;
    }
    updateData(key, status, value) {
        this.data[key] = value || status;
        if (status) {
            delete this.failedStatuses[key];
        }
        else {
            this.failedStatuses[key] = true;
        }
    }
}
exports.default = new HealthService();
//# sourceMappingURL=health.service.js.map