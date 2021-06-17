"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const config_1 = __importDefault(require("test/config"));
const specHelper_1 = __importDefault(require("test/helper/specHelper"));
describe('Uploading', () => {
    const user = specHelper_1.default.getFixture(specHelper_1.default.FIXTURE_TYPES.USER);
    specHelper_1.default.withUser({
        data: user,
    });
    describe('Unauthorized', () => {
        describe('/upload/get-upload-url', () => {
            specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/upload/get-upload-url`, {}), 401);
        });
        describe('/upload/multipart/start', () => {
            specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/upload/multipart/start`, {}), 401);
        });
        describe('/upload/multipart/get-upload-url', () => {
            specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/upload/multipart/get-upload-url`, {}), 401);
        });
        describe('/upload/multipart/complete', () => {
            specHelper_1.default.checkResponse(() => specHelper_1.default.post(`${config_1.default.baseUrl}/upload/multipart/complete`, {}), 401);
        });
    });
    describe('Authorized', () => {
        describe('single file upload', () => {
            describe('should get upload URL', () => {
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.post(`${config_1.default.baseUrl}/upload/get-upload-url`, { type: 'avatar', fileType: 'image/jpeg' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                }, 200, {
                    mask: ['data.url'],
                });
            });
        });
        describe('multipart upload', () => {
            specHelper_1.default.checkResponse(function () {
                return specHelper_1.default.post(`${config_1.default.baseUrl}/upload/multipart/start`, { type: 'video', fileType: 'video/mp4' }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
            }, 200, {
                mask: ['data.key'],
            });
            describe('should complete upload', () => {
                specHelper_1.default.checkResponse(function () {
                    return specHelper_1.default.post(`${config_1.default.baseUrl}/upload/multipart/complete`, { key: 'key', uploadId: 'uploadId', parts: [{ ETag: 'ETag', PartNumber: 1 }] }, { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } });
                }, 200, {});
            });
        });
    });
});
//# sourceMappingURL=upload.spec.js.map