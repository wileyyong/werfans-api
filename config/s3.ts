import fs from 'fs';
import { EventEmitter } from 'events';
import AWS, { AWSError } from 'aws-sdk';
import app from 'app';
import S3 from 'aws-sdk/clients/s3';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';

const { createLog, config: { isTest, s3: { accessKeyId, secretAccessKey } } } = app;

const s3Instance = new AWS.S3({
  signatureVersion: 'v4',
  accessKeyId,
  secretAccessKey,
});

if (isTest) {
  const log = createLog(module);
  Object.assign(s3Instance, {
    getSignedUrl(
      operation: string,
      params: any,
      callback: (err: Error | null, url: string) => void,
    ): string {
      log.debug('s3.getSignedUrl stub called');
      const signedUrl = 'signedUrl';
      callback(null, signedUrl);
      return signedUrl;
    },
    createMultipartUpload(
      params: S3.CreateMultipartUploadRequest,
      callback: (err: AWSError | null, data: S3.CreateMultipartUploadOutput) => void,
    ) {
      log.debug('s3.createMultipartUpload stub called');
      callback(null, {
        Key: 'Key',
        UploadId: 'UploadId',
      });
    },
    completeMultipartUpload(
      params: S3.CompleteMultipartUploadRequest,
      callback: (err: AWSError | null, data: S3.CompleteMultipartUploadOutput) => void,
    ) {
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
      const eventEmitter = new EventEmitter();
      // @ts-ignore
      eventEmitter.send = () => {
        eventEmitter.emit('httpData', fs.readFileSync('./test/video.mp4'));
        eventEmitter.emit('complete');
      };
      // @ts-ignore
      eventEmitter.createReadStream = () => fs.createReadStream('./test/video.mp4');
      return eventEmitter;
    },
    upload(
      params: S3.Types.PutObjectRequest,
      callback?: (err?: Error, data?: ManagedUpload.SendData) => void,
    ) {
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

export default s3Instance;
