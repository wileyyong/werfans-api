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
exports.uploadFile = exports.downloadFile = exports.deleteObjects = exports.completeMultipartUpload = exports.getMultipartSignedUrl = exports.createMultipartUpload = exports.getSignedUrl = exports.generateKey = void 0;
const fs_1 = __importDefault(require("fs"));
// TODO: Migrate to tmp-promise and add cleaning up
const tmp_1 = __importDefault(require("tmp"));
const app_1 = __importDefault(require("app"));
const s3_1 = __importDefault(require("config/s3"));
const fromCallback_1 = __importDefault(require("./helpers/fromCallback"));
// TODO: Inline config/s3 here, and convert this file to service
function generateId(length = 40) {
    let result = '';
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
    const charactersLength = characters.length;
    for (let i = 0; i < length; i += 1) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}
function generateKey(fileType, type, userId) {
    const extension = fileType.replace(/^.*\//, '');
    const name = generateId();
    return `${type}/${userId}/${name}.${extension}`;
}
exports.generateKey = generateKey;
/**
 * Get s3 presigned url
 */
function getSignedUrl({ type, fileType, userId }) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = generateKey(fileType, type, userId);
        const params = {
            Bucket: app_1.default.config.s3.bucket,
            Key: key,
            Expires: 60 * 60,
            ACL: 'public-read',
            ContentType: fileType,
        };
        const signedUrl = yield fromCallback_1.default((callback) => {
            s3_1.default.getSignedUrl('putObject', params, callback);
        });
        return {
            url: `${app_1.default.config.s3.url}${key}`,
            signedUrl,
        };
    });
}
exports.getSignedUrl = getSignedUrl;
/**
 * Init s3 multipart upload
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
function createMultipartUpload({ type, fileType, userId, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const key = generateKey(fileType, type, userId);
        const params = {
            Bucket: app_1.default.config.s3.bucket,
            Key: key,
            ContentType: fileType,
            ACL: 'public-read',
            Expires: new Date(Date.now() + 60 * 60 * 1000),
        };
        return new Promise((resolve, reject) => {
            s3_1.default.createMultipartUpload(params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve({
                    key,
                    uploadId: data.UploadId,
                });
            });
        });
    });
}
exports.createMultipartUpload = createMultipartUpload;
/**
 * Get multipart signed url
 * @param  {} req
 * @return {Promise}
 */
function getMultipartSignedUrl({ key, uploadId, partNumber, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            Bucket: app_1.default.config.s3.bucket,
            Key: key,
            PartNumber: partNumber,
            UploadId: uploadId,
        };
        return s3_1.default.getSignedUrl('uploadPart', params);
    });
}
exports.getMultipartSignedUrl = getMultipartSignedUrl;
function completeMultipartUpload({ key, uploadId, parts, }) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            Bucket: app_1.default.config.s3.bucket,
            Key: key,
            MultipartUpload: {
                Parts: parts,
            },
            UploadId: uploadId,
        };
        return new Promise((resolve, reject) => {
            s3_1.default.completeMultipartUpload(params, (err, data) => {
                if (err) {
                    return reject(err);
                }
                return resolve(data);
            });
        });
    });
}
exports.completeMultipartUpload = completeMultipartUpload;
/**
 * Remove file
 * @param  {} filename
 * @return {Promise}
 */
function deleteObjects(filename) {
    return __awaiter(this, void 0, void 0, function* () {
        const params = {
            Bucket: app_1.default.config.s3.bucket,
            Delete: {
                Objects: [{
                        Key: filename.replace(`https://${app_1.default.config.s3.bucket}/`, ''),
                    }],
            },
        };
        return s3_1.default.deleteObjects(params);
    });
}
exports.deleteObjects = deleteObjects;
/**
 *
 * @param s3Path s3 path is assumed as s3://bucket/key
 */
function getS3ObjectDesc(s3Path) {
    const inputPathArray = s3Path.split('/');
    const hosname = inputPathArray[2];
    const bucket = hosname.split('.')[0];
    const key = inputPathArray.slice(3).join('/');
    return { Bucket: bucket, Key: key };
}
function downloadFile(s3Path) {
    return __awaiter(this, void 0, void 0, function* () {
        const s3DownloadDestinationDir = yield fromCallback_1.default((callback) => {
            tmp_1.default.dir(callback);
        });
        // TODO: should we decode URI just in case?
        const decodedS3Path = decodeURIComponent(s3Path);
        const inputPathArray = decodedS3Path.split('/');
        const params = getS3ObjectDesc(decodedS3Path);
        const videoFileName = inputPathArray[inputPathArray.length - 1];
        const s3DownloadPath = `${s3DownloadDestinationDir}/${videoFileName}`;
        const fileStream = fs_1.default.createWriteStream(s3DownloadPath, { flags: 'w' });
        return new Promise((resolve, reject) => {
            const s3Stream = s3_1.default.getObject(params).createReadStream();
            s3Stream.on('error', (err) => {
                reject(err);
            });
            s3Stream.pipe(fileStream)
                .on('error', (err) => {
                reject(err);
            })
                .on('close', () => {
                resolve({
                    fileName: videoFileName,
                    dirPath: s3DownloadDestinationDir,
                    fullPath: s3DownloadPath,
                });
            });
        });
    });
}
exports.downloadFile = downloadFile;
function uploadFile(localPath, target, fileType) {
    return __awaiter(this, void 0, void 0, function* () {
        let params;
        if (target.url) {
            params = getS3ObjectDesc(target.url);
        }
        else {
            params = {
                Bucket: app_1.default.config.s3.bucket,
                Key: target.key,
                ACL: 'public-read',
                ContentType: fileType,
            };
        }
        // TODO: Handle file stream errors.
        //  For example, if `localPath` does not exists, it fails in wrong way.
        params.Body = fs_1.default.createReadStream(localPath);
        const sendData = yield fromCallback_1.default((callback) => {
            s3_1.default.upload(params, callback);
        });
        return sendData.Location;
    });
}
exports.uploadFile = uploadFile;
//# sourceMappingURL=s3.helper.js.map