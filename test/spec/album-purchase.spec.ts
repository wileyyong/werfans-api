import app from 'app';
import { expect } from 'chai';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

const {
  consts: { events },
  modelProvider: { User },
} = app;

describe('Album Purchase', () => {
  specHelper.withUser({
    key: 'user',
  });
  specHelper.withUser({
    key: 'ownerUser',
  });

  specHelper.withAlbum({
    userKey: 'ownerUser',
    extraData: { price: 12 },
  });

  describe('enough balance', () => {
    specHelper.resetUserBalance(13);
    specHelper.checkMoleculerEventEmit(events.payment.accepted, true, {
      mask: ['_id', 'owner', 'ref'],
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          `${testConfig.baseUrl}/albums/${this.album._id}/purchase`,
          {},
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      200,
      {},
    );
    it('balance should reduce', async function () {
      const { balance: userBalance } = await User.findById(this.user._id).select('balance').lean()!;
      expect(userBalance).to.be.equal(1);
    });
  });
  describe('not enough balance', () => {
    specHelper.resetUserBalance(11);
    specHelper.checkMoleculerEventEmit(events.payment.accepted, false);
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          `${testConfig.baseUrl}/albums/${this.album._id}/purchase`,
          {},
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      },
      400,
    );
    it('balance should not change', async function () {
      const { balance: userBalance } = await User.findById(this.user._id).select('balance').lean()!;
      expect(userBalance).to.be.equal(11);
    });
  });
});
