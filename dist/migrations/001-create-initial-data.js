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
const { config, createLog, modelProvider: { Client } } = require('app/app');
const log = createLog(module);
exports.up = (next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        log.info('Creating default client');
        const client = yield Client.findOne({ clientId: config.defaultClient.clientId });
        if (!client) {
            yield Client.create(config.defaultClient);
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.down = (next) => {
    log.info('Removing default client');
    return Client.deleteOne({ clientId: config.defaultClient.clientId }, next);
};
//# sourceMappingURL=001-create-initial-data.js.map