import app from 'app';
import { getSignedUrl, createMultipartUpload, getMultipartSignedUrl, completeMultipartUpload } from 'app/lib/s3.helper';

const BaseController = require('app/lib/base.controldone.controller');
const validateSchema = require('app/lib/validateSchema');

const {
  schemas: {
    getUploadUrlSchema,
    multipartStartSchema,
    multipartGetUrlSchema,
    multipartCompleteSchema,
  },
} = app;

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

  async getUploadUrl(scope: Record<string, any>) {
    const { body, user: { id: userId } } = scope;
    const { type, fileType } = await validateSchema(body, getUploadUrlSchema);
    const data = await getSignedUrl({ type, fileType, userId });
    return {
      data,
    };
  }

  async multipartStart(scope: Record<string, any>) {
    const { body, user: { id: userId } } = scope;
    const { type, fileType } = await validateSchema(body, multipartStartSchema);
    const { key, uploadId } = await createMultipartUpload({ type, fileType, userId });
    return {
      data: {
        key,
        uploadId,
      },
    };
  }

  async getMultipartSignedUrl(scope: Record<string, any>) {
    const { body } = scope;
    const params = await validateSchema(body, multipartGetUrlSchema);
    const data = await getMultipartSignedUrl({ ...params });
    return {
      data,
    };
  }

  async multipartComplete(scope: Record<string, any>) {
    const { body } = scope;
    const params = await validateSchema(body, multipartCompleteSchema);
    const data = await completeMultipartUpload({ ...params });
    if (data.Location) {
      // XXX: It's in the following format without that:
      // `/video%2F5ebbfee49291d7001704c2df%2FYcGmHGFYQRBFkthCqwkBnpsGEehrWRkMjRXVuwNf.mp4`
      data.Location = decodeURIComponent(data.Location);
    }
    return { data };
  }
}

export default UploadController;
