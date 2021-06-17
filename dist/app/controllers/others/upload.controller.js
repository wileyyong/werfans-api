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
const app_1 = __importDefault(require("app"));
const s3_helper_1 = require("app/lib/s3.helper");
const BaseController = require('app/lib/base.controldone.controller');
const validateSchema = require('app/lib/validateSchema');
const { schemas: { getUploadUrlSchema, multipartStartSchema, multipartGetUrlSchema, multipartCompleteSchema, }, } = app_1.default;
/**
 * @swagger
 *
 * /upload/get-upload-url:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Upload
 *     summary: Get presigned url
 *     operationId: uploadGetPresignedUrl
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadGetPresignedUrlBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadGetPresignedUrlResponse'
 * /upload/multipart/start:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Upload
 *     summary: Init multipart upload
 *     operationId: uploadMutilpartStart
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadMultipartStartBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadMultipartStartResponse'
 * /upload/multipart/get-upload-url:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Upload
 *     summary: Get upload url for multipart
 *     description: Attention (!). Uploading to received URL should return ETag in headers.
 *                  Save it along with partNumber for sending to /upload/multipart/complete.
 *     operationId: uploadMutilpartGetUploadUrl
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadMultipartGetUploadUrlBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadMultipartGetUploadUrlResponse'
 * /upload/multipart/complete:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Upload
 *     summary: Complete multipart upload
 *     operationId: uploadMutipartComplete
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UploadMultipartCompleteBody'
 *     responses:
 *       '200':
 *         description: OK
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/UploadMultipartCompleteResponse'
 * components:
 *   schemas:
 *     UploadMultipartGetUploadUrlBody:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         partNumber:
 *           type: number
 *           min: 1
 *         uploadId:
 *           type: string
 *     UploadMultipartGetUploadUrlResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: string
 *           description: url to put chunk to
 *     UploadMultipartStartBody:
 *       type: object
 *       properties:
 *         type:
 *           type: string
 *           enum:
 *             - video
 *         fileType:
 *           type: string
 *           description: 'e.g: video/mp4'
 *     UploadMultipartStartResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             key:
 *               type: string
 *               description: path to access with
 *             uploadId:
 *               type: string
 *     UploadGetPresignedUrlBody:
 *       type: object
 *       properties:
 *         type:
 *           type: number
 *           enum:
 *             - avatar
 *         fileType:
 *           type: string
 *           description: 'e.g: image/jpg, video/mp4'
 *     UploadGetPresignedUrlResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             url:
 *               type: string
 *               description: url to access with
 *             signedUrl:
 *               type: string
 *               description: url to access with
 *     UploadMultipartCompleteBody:
 *       type: object
 *       properties:
 *         key:
 *           type: string
 *         parts:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               ETag:
 *                 type: string
 *               PartNumber:
 *                 type: number
 *         uploadId:
 *           type: string
 *     UploadMultipartCompleteResponse:
 *       type: object
 *       properties:
 *         data:
 *           type: object
 *           properties:
 *             Location:
 *               type: string
 *               description: full file URL location
 *             Bucket:
 *               type: string
 *             Key:
 *               type: string
 *               description: file location key
 *             ETag:
 *               type: string
 *               description: complete response ETag
 */
class UploadController extends BaseController {
    constructor(options = {}) {
        Object.assign(options, {
            path: '/upload',
            actions: {
                getUploadUrl: BaseController.createAction({
                    auth: [BaseController.AUTH.BEARER],
                    method: 'post',
                    path: 'get-upload-url',
                }),
                multipartStart: BaseController.createAction({
                    auth: [BaseController.AUTH.BEARER],
                    method: 'post',
                    path: 'multipart/start',
                }),
                getMultipartSignedUrl: BaseController.createAction({
                    auth: [BaseController.AUTH.BEARER],
                    method: 'post',
                    path: 'multipart/get-upload-url',
                }),
                multipartComplete: BaseController.createAction({
                    auth: [BaseController.AUTH.BEARER],
                    method: 'post',
                    path: 'multipart/complete',
                }),
            },
        });
        super(options);
    }
    getUploadUrl(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body, user: { id: userId } } = scope;
            const { type, fileType } = yield validateSchema(body, getUploadUrlSchema);
            const data = yield s3_helper_1.getSignedUrl({ type, fileType, userId });
            return {
                data,
            };
        });
    }
    multipartStart(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body, user: { id: userId } } = scope;
            const { type, fileType } = yield validateSchema(body, multipartStartSchema);
            const { key, uploadId } = yield s3_helper_1.createMultipartUpload({ type, fileType, userId });
            return {
                data: {
                    key,
                    uploadId,
                },
            };
        });
    }
    getMultipartSignedUrl(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = scope;
            const params = yield validateSchema(body, multipartGetUrlSchema);
            const data = yield s3_helper_1.getMultipartSignedUrl(Object.assign({}, params));
            return {
                data,
            };
        });
    }
    multipartComplete(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body } = scope;
            const params = yield validateSchema(body, multipartCompleteSchema);
            const data = yield s3_helper_1.completeMultipartUpload(Object.assign({}, params));
            if (data.Location) {
                // XXX: It's in the following format without that:
                // `/video%2F5ebbfee49291d7001704c2df%2FYcGmHGFYQRBFkthCqwkBnpsGEehrWRkMjRXVuwNf.mp4`
                data.Location = decodeURIComponent(data.Location);
            }
            return { data };
        });
    }
}
exports.default = UploadController;
//# sourceMappingURL=upload.controller.js.map