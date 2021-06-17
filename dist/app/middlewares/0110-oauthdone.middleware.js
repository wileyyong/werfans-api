"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
// @ts-ignore
const oauthdone_1 = __importDefault(require("oauthdone"));
const authDelegate_1 = __importDefault(require("app/lib/authDelegate"));
exports.default = (expressApp) => {
    const authDelegate = new authDelegate_1.default();
    // @ts-ignore
    const oAuthdone = new oauthdone_1.default(authDelegate);
    expressApp.route('/oauth').post(oAuthdone.getToken());
    expressApp.oAuthdone = oAuthdone;
};
//# sourceMappingURL=0110-oauthdone.middleware.js.map