"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const events_1 = require("events");
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const app_1 = __importDefault(require("app"));
const { createLog, config: { isTest, s3: { accessKeyId, secretAccessKey } } } = app_1.default;
const s3Instance = new aws_sdk_1.default.S3({
    signatureVersion: 'v4',
    accessKeyId,
    secretAccessKey,
});
if (isTest) {
    const log = createLog(module);
    Object.assign(s3Instance, {
        getSignedUrl(operation, params, callback) {
            log.debug('s3.getSignedUrl stub called');
            const signedUrl = 'signedUrl';
            callback(null, signedUrl);
            return signedUrl;
        },
        createMultipartUpload(params, callback) {
            log.debug('s3.createMultipartUpload stub called');
            callback(null, {
                Key: 'Key',
                UploadId: 'UploadId',
            });
        },
        completeMultipartUpload(params, callback) {
            log.debug('s3.completeMultipartUpload stub called');
            callback(null, {
                Bucket: 'Bucket',
                ETag: 'ETag',
                Key: 'Key',
                Location: 'Location',
            });
        },
        deleteObjects() {
            log.debug('s3.deleteObjects stub called');
        },
        getObject() {
            log.debug('s3.getObject stub called');
            const eventEmitter = new events_1.EventEmitter();
            // @ts-ignore
            eventEmitter.send = () => {
                eventEmitter.emit('httpData', fs_1.default.readFileSync('./test/video.mp4'));
                eventEmitter.emit('complete');
            };
            // @ts-ignore
            eventEmitter.createReadStream = () => fs_1.default.createReadStream('./test/video.mp4');
            return eventEmitter;
        },
        upload(params, callback) {
            log.debug('s3.uploadFile stub called');
            if (callback) {
                callback(undefined, {
                    Location: 'http://url.io/uploadedFileLocation',
                    Bucket: 'uploadedFileBucket',
                    Key: 'uploadedFileKey',
                    ETag: 'uploadedETag',
                });
            }
        },
    });
}
exports.default = s3Instance;
//# sourceMappingURL=s3.js.map