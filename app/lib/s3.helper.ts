import fs from 'fs';
// TODO: Migrate to tmp-promise and add cleaning up
import tmp from 'tmp';
import app from 'app';
import { ManagedUpload } from 'aws-sdk/lib/s3/managed_upload';

import {
  CompleteMultipartUploadOutput,
  CompleteMultipartUploadRequest,
  CreateMultipartUploadRequest,
  PutObjectRequest,
} from 'aws-sdk/clients/s3';
import s3Instance from 'config/s3';
import fromCallback from './helpers/fromCallback';

import SendData = ManagedUpload.SendData;

// TODO: Inline config/s3 here, and convert this file to service

function generateId(length: number = 40) {
  let result = '';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
  const charactersLength = characters.length;
  for (let i = 0; i < length; i += 1) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }

  return result;
}

type GetSignedUrlParams = {
  type: 'avatar';
  fileType: string;
  userId: string;
};

type GetMultipartSignedUrlParams = {
  key: string;
  uploadId: string;
  partNumber: number;
};

type PartParam = {
  ETag: string;
  PartNumber: number;
};

type CompleteMultipartParams = {
  key: string;
  uploadId: string;
  parts: Array<PartParam>;
};

type CreateMultipartUploadParams = GetSignedUrlParams;

type CreateMultipartUploadResult = {
  key: string;
  uploadId?: string;
};

export interface FileDetail {
  fileName: string;
  dirPath: string;
  fullPath: string;
}

interface TargetUrl {
  url: string,
}

interface TargetKey {
  key: string,
}

type Target = TargetUrl | TargetKey;

interface S3ObjectDesc {
  Bucket: string;
  Key: string;
}

export function generateKey(fileType: string, type: 'avatar', userId: string) {
  const extension = fileType.replace(/^.*\//, '');
  const name = generateId();
  return `${type}/${userId}/${name}.${extension}`;
}

/**
 * Get s3 presigned url
 */
export async function getSignedUrl({ type, fileType, userId }: GetSignedUrlParams) {
  const key = generateKey(fileType, type, userId);
  const params = {
    Bucket: app.config.s3.bucket,
    Key: key,
    Expires: 60 * 60, // seconds
    ACL: 'public-read',
    ContentType: fileType,
  };

  const signedUrl = await fromCallback((callback) => {
    s3Instance.getSignedUrl('putObject', params, callback);
  });

  return {
    url: `${app.config.s3.url}${key}`,
    signedUrl,
  };
}

/**
 * Init s3 multipart upload
 * @param  {[type]} req [description]
 * @return {[type]}     [description]
 */
export async function createMultipartUpload({
  type,
  fileType,
  userId,
}: CreateMultipartUploadParams): Promise<CreateMultipartUploadResult> {
  const key = generateKey(fileType, type, userId);
  const params = {
    Bucket: app.config.s3.bucket,
    Key: key,
    ContentType: fileType,
    ACL: 'public-read',
    Expires: new Date(Date.now() + 60 * 60 * 1000),
  } as CreateMultipartUploadRequest;

  return new Promise((resolve, reject) => {
    s3Instance.createMultipartUpload(params, (err, data) => {
      if (err) {
        return reject(err);
      }
      return resolve({
        key,
        uploadId: data.UploadId,
      });
    });
  });
}

/**
 * Get multipart signed url
 * @param  {} req
 * @return {Promise}
 */
export async function getMultipartSignedUrl({
  key,
  uploadId,
  partNumber,
}: GetMultipartSignedUrlParams) {
  const params = {
    Bucket: app.config.s3.bucket,
    Key: key,
    PartNumber: partNumber,
    UploadId: uploadId,
  };

  return s3Instance.getSignedUrl('uploadPart', params);
}

export async function completeMultipartUpload({
  key,
  uploadId,
  parts,
}: CompleteMultipartParams): Promise<CompleteMultipartUploadOutput> {
  const params = {
    Bucket: app.config.s3.bucket,
    Key: key,
    MultipartUpload: {
      Parts: parts,
    },
    UploadId: uploadId,
  } as CompleteMultipartUploadRequest;

  return new Promise((resolve, reject) => {
    s3Instance.completeMultipartUpload(params, (err, data) => {
      if (err) {
        return reject(err);
      }

      return resolve(data);
    });
  });
}

/**
 * Remove file
 * @param  {} filename
 * @return {Promise}
 */
export async function deleteObjects(filename: string) {
  const params = {
    Bucket: app.config.s3.bucket,
    Delete: {
      Objects: [{
        Key: filename.replace(`https://${app.config.s3.bucket}/`, ''),
      }],
    },
  };

  return s3Instance.deleteObjects(params);
}

/**
 *
 * @param s3Path s3 path is assumed as s3://bucket/key
 */
function getS3ObjectDesc(s3Path: string): S3ObjectDesc {
  const inputPathArray = s3Path.split('/');
  const hosname = inputPathArray[2];
  const bucket = hosname.split('.')[0];
  const key = inputPathArray.slice(3).join('/');

  return { Bucket: bucket, Key: key };
}

export async function downloadFile(s3Path: string): Promise<FileDetail> {
  const s3DownloadDestinationDir: string = await fromCallback((callback) => {
    tmp.dir(callback);
  });

  // TODO: should we decode URI just in case?
  const decodedS3Path = decodeURIComponent(s3Path);
  const inputPathArray = decodedS3Path.split('/');
  const params = getS3ObjectDesc(decodedS3Path);
  const videoFileName = inputPathArray[inputPathArray.length - 1];

  const s3DownloadPath = `${s3DownloadDestinationDir}/${videoFileName}`;

  const fileStream = fs.createWriteStream(s3DownloadPath, { flags: 'w' });

  return new Promise<FileDetail>((resolve, reject) => {
    const s3Stream = s3Instance.getObject(params).createReadStream();

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
}

export async function uploadFile(localPath: string, target: Target, fileType: string) {
  let params: PutObjectRequest;
  if ((<TargetUrl>target).url) {
    params = <PutObjectRequest>getS3ObjectDesc((<TargetUrl>target).url);
  } else {
    params = {
      Bucket: app.config.s3.bucket,
      Key: (<TargetKey>target).key,
      ACL: 'public-read',
      ContentType: fileType,
    };
  }
  // TODO: Handle file stream errors.
  //  For example, if `localPath` does not exists, it fails in wrong way.
  params.Body = fs.createReadStream(localPath);
  const sendData: SendData = await fromCallback((callback) => {
    s3Instance.upload(params, callback);
  });
  return sendData.Location;
}
