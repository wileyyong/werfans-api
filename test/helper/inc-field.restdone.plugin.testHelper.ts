import { expect } from 'chai';
import { Model, Types } from 'mongoose';
import specHelper, { FIXTURE_TYPES } from './specHelper';

import Context = Mocha.Context;

export function createTest(
  model: Model<any>,
  fieldName: string,
  prepare: () => void,
  key: string,
  buildUrl: (id: string) => string,
  checkAfterInc?: () => unknown,
  isForced: boolean = false,
) {
  const userData = specHelper.getFixture(FIXTURE_TYPES.USER, 1);
  const otherUserData = specHelper.getFixture(FIXTURE_TYPES.USER, 1);

  specHelper.withUser({
    key: 'user',
    data: userData,
  });
  specHelper.withUser({
    key: 'otherUser',
    data: otherUserData,
  });

  prepare();

  describe('for existing record', () => {
    async function fetchField(this: Context) {
      const doc = await model.findOne({ _id: this[key]._id }).select(fieldName).lean();
      return doc[fieldName];
    }

    let valueBefore: number;
    before(async function () {
      valueBefore = await fetchField.call(this);
    });
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          buildUrl(this[key]._id),
          {},
          {
            headers: {
              Authorization: `Bearer ${this.otherUser.auth.access_token}`,
            },
          },
        );
      },
      204,
    );

    it('should update value', async function () {
      const valueAfter = await fetchField.call(this);
      return expect(valueAfter).equal(valueBefore + 1);
    });

    if (checkAfterInc) {
      checkAfterInc();
    }
  });

  describe('for not existing record', () => {
    specHelper.checkResponse(
      function (this: Context) {
        return specHelper.post(
          buildUrl((new Types.ObjectId()).toHexString()),
          {},
          {
            headers: {
              Authorization: `Bearer ${this.otherUser.auth.access_token}`,
            },
          },
        );
      },
      404,
      {
        isForced,
        description: 'should return NOT FOUND',
      },
    );
  });
}
