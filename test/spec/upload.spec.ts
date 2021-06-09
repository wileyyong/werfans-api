import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

describe('Uploading', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);

  specHelper.withUser({
    data: user,
  });

  describe('Unauthorized', () => {
    describe('/upload/get-upload-url', () => {
      specHelper.checkResponse(
        () => specHelper.post(
          `${testConfig.baseUrl}/upload/get-upload-url`,
          {},
        ),
        401,
      );
    });
    describe('/upload/multipart/start', () => {
      specHelper.checkResponse(
        () => specHelper.post(
          `${testConfig.baseUrl}/upload/multipart/start`,
          {},
        ),
        401,
      );
    });
    describe('/upload/multipart/get-upload-url', () => {
      specHelper.checkResponse(
        () => specHelper.post(
          `${testConfig.baseUrl}/upload/multipart/get-upload-url`,
          {},
        ),
        401,
      );
    });
    describe('/upload/multipart/complete', () => {
      specHelper.checkResponse(
        () => specHelper.post(
          `${testConfig.baseUrl}/upload/multipart/complete`,
          {},
        ),
        401,
      );
    });
  });

  describe('Authorized', () => {
    describe('single file upload', () => {
      describe('should get upload URL', () => {
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.post(
              `${testConfig.baseUrl}/upload/get-upload-url`,
              { type: 'avatar', fileType: 'image/jpeg' },
              { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
            );
          },
          200,
          {
            mask: ['data.url'],
          },
        );
      });
    });

    describe('multipart upload', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/upload/multipart/start`,
            { type: 'video', fileType: 'video/mp4' },
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: ['data.key'],
        },
      );

      describe('should complete upload', () => {
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.post(
              `${testConfig.baseUrl}/upload/multipart/complete`,
              { key: 'key', uploadId: 'uploadId', parts: [{ ETag: 'ETag', PartNumber: 1 }] },
              { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
            );
          },
          200,
          {},
        );
      });
    });
  });
});
