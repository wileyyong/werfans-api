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
const { createLog, modelProvider: { Photo } } = require('app/app');
const log = createLog(module);
exports.up = (next) => __awaiter(void 0, void 0, void 0, function* () {
    log.info('Fill photo viewsCounter');
    try {
        yield Photo.updateMany({
            viewsCounter: { $exists: false },
        }, {
            $set: {
                viewsCounter: 0,
            },
        });
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.down = (next) => __awaiter(void 0, void 0, void 0, function* () {
    next();
});
//# sourceMappingURL=006-fill-photo-viewsCounter.js.map