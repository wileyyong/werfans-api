"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createTest = void 0;
const chai_1 = require("chai");
const mongoose_1 = require("mongoose");
const specHelper_1 = __importStar(require("./specHelper"));
function createTest(model, fieldName, prepare, key, buildUrl, checkAfterInc, isForced = false) {
    const userData = specHelper_1.default.getFixture(specHelper_1.FIXTURE_TYPES.USER, 1);
    const otherUserData = specHelper_1.default.getFixture(specHelper_1.FIXTURE_TYPES.USER, 1);
    specHelper_1.default.withUser({
        key: 'user',
        data: userData,
    });
    specHelper_1.default.withUser({
        key: 'otherUser',
        data: otherUserData,
    });
    prepare();
    describe('for existing record', () => {
        function fetchField() {
            return __awaiter(this, void 0, void 0, function* () {
                const doc = yield model.findOne({ _id: this[key]._id }).select(fieldName).lean();
                return doc[fieldName];
            });
        }
        let valueBefore;
        before(function () {
            return __awaiter(this, void 0, void 0, function* () {
                valueBefore = yield fetchField.call(this);
            });
        });
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(buildUrl(this[key]._id), {}, {
                headers: {
                    Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                },
            });
        }, 204);
        it('should update value', function () {
            return __awaiter(this, void 0, void 0, function* () {
                const valueAfter = yield fetchField.call(this);
                return chai_1.expect(valueAfter).equal(valueBefore + 1);
            });
        });
        if (checkAfterInc) {
            checkAfterInc();
        }
    });
    describe('for not existing record', () => {
        specHelper_1.default.checkResponse(function () {
            return specHelper_1.default.post(buildUrl((new mongoose_1.Types.ObjectId()).toHexString()), {}, {
                headers: {
                    Authorization: `Bearer ${this.otherUser.auth.access_token}`,
                },
            });
        }, 404, {
            isForced,
            description: 'should return NOT FOUND',
        });
    });
}
exports.createTest = createTest;
//# sourceMappingURL=inc-field.restdone.plugin.testHelper.js.map