/**
 * Created by mk on 08/07/16.
 */

import { expect } from 'chai';
import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { createTest } from 'test/helper/inc-field.restdone.plugin.testHelper';

const { modelProvider: { LiveStream, User } } = app;

describe('LiveStream viewsCounter increment', () => {
  createTest(
    LiveStream,
    'viewsCounter',
    () => specHelper.withLiveStream(),
    'liveStream',
    (id: string) => `${testConfig.baseUrl}/live-streams/${id}/inc/viewsCounter`,
    () => {
      it('Should increment viewsCounter of owner', async function () {
        const doc = await User.findOne({ _id: this.user._id }).select('viewsCounter').lean();
        return expect(doc.viewsCounter).to.be.equal(1);
      });
    },
  );
});
