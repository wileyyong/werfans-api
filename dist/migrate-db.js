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
// @ts-ignore
const migrate_1 = __importDefault(require("migrate"));
const app_1 = __importDefault(require("app"));
app_1.default.config.isMigration = true;
module.exports = () => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield app_1.default.init();
        const log = app_1.default.createLog(module);
        const { modelProvider: { Migration } } = app_1.default;
        const key = 'main';
        log.info('Running migration...');
        const migration = migrate_1.default.load('migrations/.migrate', 'migrations');
        migration.save = function save(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                try {
                    yield Migration
                        .findOneAndUpdate({
                        key,
                    }, {
                        migrations: this.migrations,
                        pos: this.pos,
                    }, {
                        new: true,
                        upsert: true,
                        setDefaultsOnInsert: true,
                    });
                    this.emit('save');
                    callback();
                }
                catch (err) {
                    callback(err);
                }
            });
        };
        migration.load = function load(callback) {
            return __awaiter(this, void 0, void 0, function* () {
                this.emit('load');
                try {
                    let migrationData = yield Migration.findOne({ key }).lean();
                    if (!migrationData) {
                        migrationData = {
                            pos: 0,
                        };
                    }
                    callback(null, migrationData);
                }
                catch (err) {
                    callback(err);
                }
            });
        };
        const isUp = (process.argv[3] !== 'down');
        const callback = (err) => {
            if (err) {
                throw err;
            }
            log.info('Migration completed');
            process.exit(0);
        };
        if (isUp) {
            log.info('migrating up');
            migration.up(callback);
        }
        else {
            log.info('migrating down');
            migration.down(callback);
        }
    }
    catch (err) {
        // eslint-disable-next-line no-console
        console.error('The migration failed with error', err);
        process.exit(1);
    }
});
//# sourceMappingURL=migrate-db.js.map