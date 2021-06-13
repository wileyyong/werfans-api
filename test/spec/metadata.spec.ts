import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

import Context = Mocha.Context;

describe('Metadata', () => {
  const user = specHelper.getFixture(specHelper.FIXTURE_TYPES.USER);

  specHelper.withUser({
    data: user,
  });

  describe('Unauthorized', () => {
    describe('/metadata', () => {
      specHelper.checkResponse(
        () => specHelper.get(
          `${testConfig.baseUrl}/metadata`,
          {},
        ),
        401,
      );
    });
  });

  describe('Authorized', () => {
    describe('/metadata', () => {
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.get(
            `${testConfig.baseUrl}/metadata`,
            { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
          );
        },
        200,
        {
          description: 'should return metadata',
        },
      );
    });
  });
});
