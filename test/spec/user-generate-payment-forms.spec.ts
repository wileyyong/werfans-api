import url from 'url';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { expect } from 'chai';

import Context = Mocha.Context;

describe('REST /users - User generate payment forms', () => {
  describe('GET /:_id/generateFormUrl/:period', () => {
    describe('Generate form URL', () => {
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
        key: 'user',
      });

      describe('with right period', () => {
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${testConfig.baseUrl}/users/${this.user._id}/generateFormUrl/30`,
              { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
            );
          },
          200,
        );
        it('should match snapshot', function () {
          const METADATA_OCCUPANCY = 'metadata=';
          const { url: urlStr } = this.response.body;
          const fromIdx = urlStr.indexOf('metadata=');
          const toIdx = urlStr.indexOf('&', fromIdx);
          const metadataValue = urlStr.slice(fromIdx + METADATA_OCCUPANCY.length, toIdx);
          this.response.body.url = urlStr.replace(metadataValue, 'xxx');
          expect(this.response.body).matchSnapshot(this);
        });
        it('should contain user price', function () {
          const parsedUrl = url.parse(this.response.body.url, true);
          expect(parsedUrl.query.initialPrice).to.equal('49.99');
          expect(parsedUrl.query.recurringPrice).to.equal('49.99');
        });
        it('should contain period', function () {
          const parsedUrl = url.parse(this.response.body.url, true);
          expect(parsedUrl.query.initialPeriod).to.equal('30');
          expect(parsedUrl.query.recurringPeriod).to.equal('30');
        });
      });

      describe('with wrong period', () => {
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${testConfig.baseUrl}/users/${this.user._id}/generateFormUrl/3`,
              { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
            );
          },
          400,
          {},
        );
      });
    });
  });

  describe('GET /:_id/deposit/:summ', () => {
    describe('Generate form URL', () => {
      specHelper.withUser({
        data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 1),
        key: 'user',
      });

      describe('with right summ', () => {
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${testConfig.baseUrl}/users/${this.user._id}/deposit/30`,
              { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
            );
          },
          200,
        );
        it('should match snapshot', function () {
          const METADATA_OCCUPANCY = 'metadata=';
          const { url: urlStr } = this.response.body;
          const fromIdx = urlStr.indexOf('metadata=');
          const toIdx = urlStr.indexOf('&', fromIdx);
          const metadataValue = urlStr.slice(fromIdx + METADATA_OCCUPANCY.length, toIdx);
          this.response.body.url = urlStr.replace(metadataValue, 'xxx');
          expect(this.response.body).matchSnapshot(this);
        });
        it('should contain user price', function () {
          const parsedUrl = url.parse(this.response.body.url, true);
          expect(parsedUrl.query.initialPrice).to.equal('30.00');
        });
        it('should contain period', function () {
          const parsedUrl = url.parse(this.response.body.url, true);
          expect(parsedUrl.query.initialPeriod).to.equal('90');
        });
      });

      const createTest = (summ: number) => () => {
        specHelper.checkResponse(
          function (this: Context) {
            return specHelper.get(
              `${testConfig.baseUrl}/users/${this.user._id}/deposit/${summ}`,
              { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
            );
          },
          400,
          {},
        );
      };

      describe('with wrong summ lower than 3', createTest(1));
      describe('with wrong summ greater than 100', createTest(101));
    });
  });
});
