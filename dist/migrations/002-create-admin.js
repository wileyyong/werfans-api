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
const { createLog, config: { defaultUser }, modelProvider: { User } } = require('app/app');
const log = createLog(module);
exports.up = (next) => __awaiter(void 0, void 0, void 0, function* () {
    log.info('Creating default admin account');
    try {
        let user = yield User.findOne({ username: defaultUser.username });
        if (!user) {
            user = new User(defaultUser);
            user.hashedPassword = yield User.hashPassword(defaultUser.password);
            yield user.save();
        }
        next();
    }
    catch (err) {
        next(err);
    }
});
exports.down = (next) => __awaiter(void 0, void 0, void 0, function* () {
    log.info('Deleting default admin account');
    try {
        yield User.deleteOne({ username: defaultUser.username });
        next();
    }
    catch (err) {
        next(err);
    }
});
//# sourceMappingURL=002-create-admin.js.map