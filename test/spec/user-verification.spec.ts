import { expect } from 'chai';
import { Context } from 'mocha';
import app from 'app';

import testConfig from 'test/config';
import specHelper, { EmailData } from 'test/helper/specHelper';
import { UserDocument } from '../../app/domains/user';

const { modelProvider: { User } } = app;

describe('User Verification', () => {
  before('cleaning up emails', () => specHelper.fetchAndClearSentEmails());

  describe('Sign up', () => {
    let userDoc: UserDocument;
    let sentEmails: EmailData[];
    specHelper.withUser({
      key: 'newUser',
      login: false,
    });
    before('wait event processing', (done) => {
      setTimeout(done, 500);
    });
    before('fetch emails', async () => {
      sentEmails = await specHelper.fetchAndClearSentEmails();
    });
    before(async function () {
      userDoc = await User
        .findOne({ _id: this.newUser._id })
        .select('emailVerified emailVerification')
        .lean()!;
    });
    it('should set verification fields', function check() {
      specHelper.maskPaths(
        userDoc,
        [
          '_id',
          'emailVerification.token',
          'emailVerification.expires',
        ],
      ).should.matchSnapshot(this);
    });
    it('should send verification email with token', function check() {
      specHelper.maskPaths(
        sentEmails,
        [
          'to',
          {
            replace: 'html',
            withValue: `${this.newUser.email}|${userDoc.emailVerification?.token}`,
            newValue: '<REPLACED>',
          },
        ],
      ).should.matchSnapshot(this);
    });
  });

  describe('Resend verification email', () => {
    describe('not verified user', () => {
      let userDoc: UserDocument;
      let sentEmails: EmailData[];
      specHelper.withUser({
        key: 'newUser',
      });
      before('wait event processing', (done) => {
        setTimeout(done, 500);
      });
      before('cleanup emails', () => specHelper.fetchAndClearSentEmails());
      before('remove verification data', async function () {
        return User
          .updateOne(
            { _id: this.newUser._id },
            { $unset: { emailVerification: '' } },
          );
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/resend-verification`,
            {},
            { headers: { Authorization: `Bearer ${this.newUser.auth.access_token}` } },
          );
        },
        204,
      );
      before('wait event processing', (done) => {
        setTimeout(done, 500);
      });
      before('fetch emails', async () => {
        sentEmails = await specHelper.fetchAndClearSentEmails();
      });
      before(async function () {
        userDoc = await User
          .findOne({ _id: this.newUser._id })
          .select('emailVerified emailVerification')
          .lean()!;
      });

      it('should set verification fields', function check() {
        specHelper.maskPaths(
          userDoc,
          [
            '_id',
            'emailVerification.token',
            'emailVerification.expires',
          ],
        ).should.matchSnapshot(this);
      });
      it('should send verification email with token', function check() {
        specHelper.maskPaths(
          sentEmails,
          [
            'to',
            {
              replace: 'html',
              withValue: `${this.newUser.email}|${userDoc.emailVerification?.token}`,
              newValue: '<REPLACED>',
            },
          ],
        ).should.matchSnapshot(this);
      });
    });

    describe('verified user', () => {
      specHelper.withUser({
        key: 'newUser',
      });
      before('wait event processing', (done) => {
        setTimeout(done, 500);
      });
      before('cleanup emails', () => specHelper.fetchAndClearSentEmails());
      before('set verified', async function () {
        return User
          .updateOne(
            { _id: this.newUser._id },
            { emailVerified: true },
          );
      });
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.put(
            `${testConfig.baseUrl}/users/resend-verification`,
            {},
            { headers: { Authorization: `Bearer ${this.newUser.auth.access_token}` } },
          );
        },
        400,
        {},
      );
    });
  });

  describe('Verify email', () => {
    const prepareTest = (status: number, token?: string, beforeFn?: () => void) => {
      specHelper.withUser({
        key: 'user',
      });
      before('wait event processing', (done) => {
        setTimeout(done, 500);
      });
      before(async function () {
        if (!token) {
          ({ emailVerification: { token: this.token } } = await User
            .findOne({ _id: this.user._id })
            .select('emailVerification.token')
            .lean()!);
        } else {
          this.token = token;
        }
      });
      if (beforeFn) {
        before(beforeFn);
      }
      specHelper.checkResponse(
        function (this: Context) {
          return specHelper.post(
            `${testConfig.baseUrl}/users/verify-email/${this.token}`,
            { ...specHelper.getClientAuth() },
          );
        },
        status,
        status !== 204 ? {} : undefined,
      );

      before(async function () {
        ({ emailVerified: this.emailVerified } = await User
          .findOne({ _id: this.user._id })
          .select('emailVerified')
          .lean()!);
      });
    };
    describe('with valid token', () => {
      prepareTest(204);

      it('should set email verified', function () {
        return expect(this.emailVerified).to.be.true;
      });
    });

    describe('with expired token', () => {
      prepareTest(400, undefined, function expireToken(this: Context) {
        return User.updateOne(
          { _id: this.user._id },
          { 'emailVerification.expires': new Date() },
        );
      });

      it('should not set email verified', function () {
        return expect(this.emailVerified).to.be.false;
      });
    });

    describe('with wrong token', () => {
      prepareTest(400, 'wrong token');

      it('should not set email verified', function () {
        return expect(this.emailVerified).to.be.false;
      });
    });
  });
});
