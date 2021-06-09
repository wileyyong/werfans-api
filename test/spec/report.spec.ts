import { expect } from 'chai';

import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { ReportResource } from '../../app/domains/report';
import Context = Mocha.Context;

const MASKING_FIELDS = [
  '_id',
  'author',
  'complainUser',
  'createdAt',
  'updatedAt',
];

const MASKING_FIELDS_POPULATED = [
  '_id',
  'author',
  'complainUser._id',
  'createdAt',
  'updatedAt',
];

describe('Report', () => {
  const userData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1);
  const complainUserData = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2);
  const reportData: Partial<ReportResource> = specHelper.getFixture(
    specHelper.FIXTURE_TYPES.REPORT,
    1,
  );

  specHelper.withAdminUser();
  specHelper.withUser({
    data: userData,
    key: 'user',
  });
  specHelper.withUser({
    data: complainUserData,
    key: 'complainUser',
  });
  before('prepare report', function () {
    reportData.complainUser = this.complainUser._id;
  });

  describe('Create', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          `${testConfig.baseUrl}/users/me/reports`,
          reportData,
          {
            headers: {
              Authorization: `Bearer ${this.user.auth.access_token}`,
            },
          },
        );
      },
      201,
      {
        mask: MASKING_FIELDS,
      },
    );
    after('remove report', function () {
      return specHelper.removeReport(this.response.body);
    });
    it('should have author user to current user', function () {
      expect(this.response.body.author).to.be.equal(this.user._id);
    });
  });

  describe('Get List', () => {
    specHelper.withReport({
      data: reportData,
    });
    describe('by owner', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/reports`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
    });
    describe('by admin', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/reports`,
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
    });
  });

  describe('Get One', () => {
    specHelper.withReport({
      data: reportData,
    });
    describe('by owner', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/reports/${this.report._id}`,
            {
              headers: {
                Authorization: `Bearer ${this.user.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
      it('should have author user to current user', function () {
        expect(this.response.body.author._id).to.be.equal(this.user._id);
      });
    });
    describe('by admin', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/reports/${this.report._id}`,
            {
              headers: {
                Authorization: `Bearer ${this.adminUser.auth.access_token}`,
              },
            },
          );
        },
        200,
        {
          mask: MASKING_FIELDS_POPULATED,
        },
      );
      it('should have author user to current user', function () {
        expect(this.response.body.author._id).to.be.equal(this.user._id);
      });
    });
  });

  describe('Change', () => {
    const NEW_BODY = 'new-body';
    specHelper.withReport({
      data: reportData,
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.patch(
          `${testConfig.baseUrl}/reports/${this.report._id}`,
          {
            body: NEW_BODY,
          },
          {
            headers: {
              Authorization: `Bearer ${this.user.auth.access_token}`,
            },
          },
        );
      },
      404,
    );
  });

  describe('Remove', () => {
    specHelper.withReport({
      data: reportData,
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.delete(
          `${testConfig.baseUrl}/reports/${this.report._id}`,
          {},
          {
            headers: {
              Authorization: `Bearer ${this.user.auth.access_token}`,
            },
          },
        );
      },
      404,
    );
  });
});
