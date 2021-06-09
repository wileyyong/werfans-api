/**
 * Created by mk on 08/07/16.
 */

import { expect } from 'chai';
import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { createTest } from 'test/helper/inc-field.restdone.plugin.testHelper';

const { modelProvider: { Album, User } } = app;

describe('Album viewsCounter increment', () => {
  createTest(
    Album,
    'viewsCounter',
    () => specHelper.withAlbum(),
    'album',
    (id: string) => `${testConfig.baseUrl}/albums/${id}/inc/viewsCounter`,
    () => {
      it('Should increment viewsCounter of owner', async function () {
        const doc = await User.findOne({ _id: this.user._id }).select('viewsCounter').lean();
        return expect(doc.viewsCounter).to.be.equal(1);
      });
    },
  );
});
