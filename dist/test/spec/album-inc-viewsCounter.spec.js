"use strict";
/**
 * Created by mk on 08/07/16.
 */
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
const chai_1 = require("chai");
const app_1 = __importDefault(require("app"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const inc_field_restdone_plugin_testHelper_1 = require("test/helper/inc-field.restdone.plugin.testHelper");
const { modelProvider: { Album, User } } = app_1.default;
describe('Album viewsCounter increment', () => {
    inc_field_restdone_plugin_testHelper_1.createTest(Album, 'viewsCounter', () => specHelper_1.default.withAlbum(), 'album', (id) => `${config_1.default.baseUrl}/albums/${id}/inc/viewsCounter`, () => {
        it('Should increment viewsCounter of owner', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const doc = yield User.findOne({ _id: this.user._id }).select('viewsCounter').lean();
                return chai_1.expect(doc.viewsCounter).to.be.equal(1);
            });
        });
    });
});
//# sourceMappingURL=album-inc-viewsCounter.spec.js.map