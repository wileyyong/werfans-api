import { Context } from 'mocha';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { BalanceRecordType } from '../../app/domains/balanceRecord';

const maskingFields = [
  '_id',
  'price',
  'owner',
  'createdAt',
  'updatedAt',
];

describe('BalanceRecord', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    seed: 1,
  });
  specHelper.withUser({
    key: 'otherUser',
    seed: 2,
  });

  describe('Create', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          `${testConfig.baseUrl}/users/me/balance-records`,
          {},
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      404,
      {},
    );
  });

  describe('Get list', () => {
    describe('by owner', () => {
      specHelper.withBalanceRecord({
        type: BalanceRecordType.LoadBalance,
        sum: 100,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/me/balance-records`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: maskingFields,
        },
      );
    });
    describe('by other user', () => {
      specHelper.withBalanceRecord({
        type: BalanceRecordType.LoadBalance,
        sum: 100,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/balance-records`,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Get one', () => {
    describe('by recipient', () => {
      specHelper.withBalanceRecord({
        type: BalanceRecordType.LoadBalance,
        sum: 100,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/balance-records/${this.balanceRecord._id}`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          mask: maskingFields,
        },
      );
    });
    describe('by other user', () => {
      specHelper.withBalanceRecord({
        type: BalanceRecordType.LoadBalance,
        sum: 100,
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/users/${this.user._id}/balance-records/${this.balanceRecord._id}`,
            { headers: { Authorization: `Bearer ${this.otherUser.auth.access_token}` } },
          );
        },
        403,
        {},
      );
    });
  });

  describe('Update', () => {
    specHelper.withBalanceRecord({
      type: BalanceRecordType.LoadBalance,
      sum: 100,
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.patch(
          `${testConfig.baseUrl}/users/me/balance-records/${this.balanceRecord._id}`,
          { type: 'Testing' },
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      404,
      {
        mask: ['url'],
      },
    );
  });

  describe('Delete', () => {
    specHelper.withBalanceRecord({
      type: BalanceRecordType.LoadBalance,
      sum: 100,
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.delete(
          `${testConfig.baseUrl}/users/me/balance-records/${this.balanceRecord._id}`,
          { },
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      404,
      {
        mask: ['url'],
      },
    );
  });
});
