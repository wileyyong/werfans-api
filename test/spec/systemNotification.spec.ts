import chakram, { Response } from 'chakram';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';

const { expect } = chakram;

const MASKING_FIELDS = [
  '_id',
  'author',
  'sentAt',
  'createdAt',
  'updatedAt',
];

const MASKING_FIELDS_POPULATED = [
  '_id',
  'author',
  'author._id',
  'sentAt',
  'createdAt',
  'updatedAt',
];

describe('SystemNotification', () => {
  specHelper.withAdminUser();
  specHelper.withUser({
    data: specHelper.getFixture(specHelper.FIXTURE_TYPES.USER, 2),
    key: 'user',
  });

  describe('Create', () => {
    const systemNotification = specHelper.getFixture(specHelper.FIXTURE_TYPES.SYSTEM_NOTIFICATION);
    describe('for admin', () => {
      let response: Response;

      before('send request', async function () {
        response = await chakram.post(
          `${testConfig.baseUrl}/system-notifications`,
          systemNotification,
          { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
        );
      });

      after('remove systemNotification', () => specHelper.removeSystemNotification(response.body));

      it('should return status 201', () => expect(response).to.have.status(201));
      it('should contain fields', function () {
        return specHelper.maskPaths(
          response.body,
          MASKING_FIELDS,
        ).should.matchSnapshot(this);
      });
    });

    describe('for non-admin', () => {
      let response: Response;

      before('send request', async function () {
        response = await chakram.post(
          `${testConfig.baseUrl}/system-notifications`,
          systemNotification,
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      });

      it('should return status 403', () => expect(response).to.have.status(403));
      it('should contain error', function () {
        return response.body.should.matchSnapshot(this);
      });
    });

    describe('for unauthorized', () => {
      let response: Response;

      before('send request', async () => {
        response = await chakram.post(
          `${testConfig.baseUrl}/system-notifications`,
          systemNotification,
          { headers: { Authorization: '' } },
        );
      });

      it('should return status 401', () => expect(response).to.have.status(401));
      it('should contain error', function () {
        return response.body.should.matchSnapshot(this);
      });
    });
  });

  describe('Get list', () => {
    describe('for admin', () => {
      let response: Response;
      specHelper.withSystemNotification();
      before('send request', async function () {
        response = await chakram.get(
          `${testConfig.baseUrl}/system-notifications`,
          { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
        );
      });

      it('should return status 200', () => {
        expect(response).to.have.status(200);
      });
      it('should contain fields', function () {
        return specHelper.maskPaths(
          response.body,
          MASKING_FIELDS_POPULATED,
        ).should.matchSnapshot(this);
      });
    });

    describe('for non-admin', () => {
      let response: Response;
      specHelper.withSystemNotification();
      before('send request', async function () {
        response = await chakram.get(
          `${testConfig.baseUrl}/system-notifications`,
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      });

      it('should return status 403', () => expect(response).to.have.status(403));
      it('should contain error', function () {
        return response.body.should.matchSnapshot(this);
      });
    });
  });

  describe('Remove', () => {
    describe('for admin', () => {
      let response: Response;

      specHelper.withSystemNotification();

      before('send request', async function () {
        response = await chakram.delete(
          `${testConfig.baseUrl}/system-notifications/${this.systemNotification._id}`,
          {},
          { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
        );
      });

      it('should return status 204', () => expect(response).to.have.status(204));
    });

    describe('for non-admin', () => {
      let response: Response;

      specHelper.withSystemNotification();

      before('send request', async function () {
        response = await chakram.patch(
          `${testConfig.baseUrl}/system-notifications/${this.systemNotification._id}`,
          {},
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      });

      it('should return status 403', () => expect(response).to.have.status(403));
    });
  });

  describe('Update', () => {
    describe('for admin', () => {
      let response: Response;

      specHelper.withSystemNotification();

      before('send request', async function () {
        response = await chakram.patch(
          `${testConfig.baseUrl}/system-notifications/${this.systemNotification._id}`,
          { notificationType: 'PrivateMessageReceived' },
          { headers: { Authorization: `Bearer ${this.adminUser.auth.access_token}` } },
        );
      });

      it('should return status 200', () => expect(response).to.have.status(200));
      it('should contain fields', function () {
        return specHelper.maskPaths(
          response.body,
          MASKING_FIELDS_POPULATED,
        ).should.matchSnapshot(this);
      });
    });

    describe('for non-admin', () => {
      let response: Response;

      specHelper.withSystemNotification();

      before('send request', async function () {
        response = await chakram.patch(
          `${testConfig.baseUrl}/system-notifications/${this.systemNotification._id}`,
          { notificationType: 'PrivateMessageReceived' },
          { headers: { Authorization: `Bearer ${this.user.auth.access_token}` } },
        );
      });

      it('should return status 403', () => expect(response).to.have.status(403));
      it('should contain error', function () {
        return response.body.should.matchSnapshot(this);
      });
    });
  });
});
