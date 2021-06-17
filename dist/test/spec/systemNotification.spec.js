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
const chakram_1 = __importDefault(require("chakram"));
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
const { expect } = chakram_1.default;
const MASKING_FIELDS = [
    '_id',
    'author',
    'sentAt',
    'createdAt',
    'updatedAt',
];
const MASKING_FIELDS_POPULATED = [
    '_id',
    'author',
    'author._id',
    'sentAt',
    'createdAt',
    'updatedAt',
];
describe('SystemNotification', () => {
    specHelper_1.default.withAdminUser();
    specHelper_1.default.withUser({
        data: specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER, 2),
        key: 'user',
    });
    describe('Create', () => {
        const systemNotification = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.SYSTEM_NOTIFICATION);
        describe('for admin', () => {
            let response;
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.post(`${config_1.default.baseUrl}/system-notifications`, systemNotification, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
                });
            });
            after('remove systemNotification', () => specHelper_1.default.removeSystemNotification(response.body));
            it('should return status 201', () => expect(response).to.have.status(201));
            it('should contain fields', function () {
                return specHelper_1.default.maskPaths(response.body, MASKING_FIELDS).should.matchSnapshot(this);
            });
        });
        describe('for non-admin', () => {
            let response;
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.post(`${config_1.default.baseUrl}/system-notifications`, systemNotification, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                });
            });
            it('should return status 403', () => expect(response).to.have.status(403));
            it('should contain error', function () {
                return response.body.should.matchSnapshot(this);
            });
        });
        describe('for unauthorized', () => {
            let response;
            before('send request', () => __awaiter(void 0, void 0, void 0, function* () {
                response = yield chakram_1.default.post(`${config_1.default.baseUrl}/system-notifications`, systemNotification, { headers: { Authorization: '' } });
            }));
            it('should return status 401', () => expect(response).to.have.status(401));
            it('should contain error', function () {
                return response.body.should.matchSnapshot(this);
            });
        });
    });
    describe('Get list', () => {
        describe('for admin', () => {
            let response;
            specHelper_1.default.withSystemNotification();
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.get(`${config_1.default.baseUrl}/system-notifications`, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
                });
            });
            it('should return status 200', () => {
                expect(response).to.have.status(200);
            });
            it('should contain fields', function () {
                return specHelper_1.default.maskPaths(response.body, MASKING_FIELDS_POPULATED).should.matchSnapshot(this);
            });
        });
        describe('for non-admin', () => {
            let response;
            specHelper_1.default.withSystemNotification();
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.get(`${config_1.default.baseUrl}/system-notifications`, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                });
            });
            it('should return status 403', () => expect(response).to.have.status(403));
            it('should contain error', function () {
                return response.body.should.matchSnapshot(this);
            });
        });
    });
    describe('Remove', () => {
        describe('for admin', () => {
            let response;
            specHelper_1.default.withSystemNotification();
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.delete(`${config_1.default.baseUrl}/system-notifications/${this.systemNotification._id}`, {}, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
                });
            });
            it('should return status 204', () => expect(response).to.have.status(204));
        });
        describe('for non-admin', () => {
            let response;
            specHelper_1.default.withSystemNotification();
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.patch(`${config_1.default.baseUrl}/system-notifications/${this.systemNotification._id}`, {}, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                });
            });
            it('should return status 403', () => expect(response).to.have.status(403));
        });
    });
    describe('Update', () => {
        describe('for admin', () => {
            let response;
            specHelper_1.default.withSystemNotification();
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.patch(`${config_1.default.baseUrl}/system-notifications/${this.systemNotification._id}`, { notificationType: 'PrivateMessageReceived' }, { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } });
                });
            });
            it('should return status 200', () => expect(response).to.have.status(200));
            it('should contain fields', function () {
                return specHelper_1.default.maskPaths(response.body, MASKING_FIELDS_POPULATED).should.matchSnapshot(this);
            });
        });
        describe('for non-admin', () => {
            let response;
            specHelper_1.default.withSystemNotification();
            before('send request', function () {
                return __awaiter(this, void 0, void 0, function* () {
                    response = yield chakram_1.default.patch(`${config_1.default.baseUrl}/system-notifications/${this.systemNotification._id}`, { notificationType: 'PrivateMessageReceived' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                });
            });
            it('should return status 403', () => expect(response).to.have.status(403));
            it('should contain error', function () {
                return response.body.should.matchSnapshot(this);
            });
        });
    });
});
//# sourceMappingURL=systemNotification.spec.js.map