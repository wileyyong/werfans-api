'use strict';
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
require('../root-require');
const prepare = require('mocha-prepare');
process.on('unhandledRejection', (reason, p) => {
    // eslint-disable-next-line no-console
    console.error('Unhandled Rejection at:', p, 'reason:', reason);
});
prepare((done) => __awaiter(void 0, void 0, void 0, function* () {
    if (process.env.NODE_ENV !== 'test') {
        // eslint-disable-next-line no-console
        console.warn('Forced NODE_ENV to test');
        global.FORCED_NODE_ENV = 'test';
    }
    // eslint-disable-next-line global-require
    const server = require('server');
    yield server();
    // eslint-disable-next-line global-require
    const specHelper = require('./helper/specHelper');
    yield specHelper.prepareDb();
    done();
}));
//# sourceMappingURL=prepare.js.map