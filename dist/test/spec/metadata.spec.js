"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
describe('Metadata', () => {
    const user = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER);
    specHelper_1.default.withUser({
        data: user,
    });
    describe('Unauthorized', () => {
        describe('/metadata', () => {
            specHelper_1.default.checkResponse(() => specHelper_1.default.get(`${config_1.default.baseUrl}/metadata`, {}), 401);
        });
    });
    describe('Authorized', () => {
        describe('/metadata', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.get(`${config_1.default.baseUrl}/metadata`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                description: 'should return metadata',
            });
        });
    });
});
//# sourceMappingURL=metadata.spec.js.map