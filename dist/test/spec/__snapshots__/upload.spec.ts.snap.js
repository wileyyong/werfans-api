"use strict";
exports[`Uploading : Authorized : single file upload : should get upload URL : response should contain body 1`] = {
    "data": {
        "url": "${data.url}",
        "signedUrl": "signedUrl"
    }
};
exports[`Uploading : Authorized : multipart upload : response should contain body 1`] = {
    "data": {
        "key": "${data.key}",
        "uploadId": "UploadId"
    }
};
exports[`Uploading : Authorized : multipart upload : should complete upload : response should contain body 1`] = {
    "data": {
        "Bucket": "Bucket",
        "ETag": "ETag",
        "Key": "Key",
        "Location": "Location"
    }
};
//# sourceMappingURL=upload.spec.ts.snap.js.map