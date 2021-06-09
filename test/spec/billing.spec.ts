import crypto from 'crypto';
import { expect } from 'chai';
import app from 'app';
import testConfig from 'test/config';
import specHelper from 'test/helper/specHelper';
import { BalanceRecordType } from 'app/domains/balanceRecord';
import { BalanceRecordRefModel } from 'app/domains/balanceRecordRefModel';
import { ICcBill } from '../../app/domains/ICcBill';
import { UserSubscription } from '../../app/domains/user';

import EventType = ICcBill.EventType;
import Context = Mocha.Context;

const {
  config: {
    billing: {
      clientAccnum,
      clientSubacc,
      flexId,
      salt,
      webhookSecret,
    },
  },
  modelProvider: {
    User,
    BalanceRecord,
  },
} = app;

const createTest = (params: {
  url?: string;
  body?: any;
  bodyBuilder?: () => any;
  eventType?: ICcBill.EventType;
  isForced?: true;
}) => {
  // eslint-disable-next-line no-restricted-properties
  const {
    url,
    body,
    bodyBuilder,
    eventType = ICcBill.EventType.NewSaleSuccess,
    isForced,
  } = params;
  specHelper.checkResponse(
    function (this: Context) {
      return specHelper.post(
        url || `${testConfig.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=${clientAccnum}&clientSubacc=${clientSubacc}&eventType=${eventType}`,
        bodyBuilder ? bodyBuilder.call(this) : body,
      );
    },
    200,
    {
      isForced,
    },
  );
};

const createMetadata = (metadata: ICcBill.Metadata) => Buffer
  .from(JSON.stringify(metadata), 'ascii')
  .toString('base64');

const subscriptionId = '1000000000';
const transactionId = '0912191101000000159';
const timestamp = '2012‐08‐05 15:18:17';

describe('REST /billing - Billing', () => {
  describe('POST /webhook/:secret - Receive Webhook', () => {
    describe('NewSaleSuccess', () => {
      const dynamicPricingValidationDigest = crypto
        .createHash('md5')
        .update(([subscriptionId, 1, salt].join('')))
        .digest('hex');
      describe('new subscription', () => {
        specHelper.withUserSocket({
          key: 'userSocket',
          userKey: 'user',
        });
        specHelper.withUserSocket({
          key: 'targetUserSocket',
          userKey: 'targetUser',
        });
        specHelper.withSocketHandler({
          eventName: 'new-user-signal',
          makeSnapShot: {
            mask: ['data.recipients', 'data.data.targetUserId'],
          },
        });
        specHelper.withSocketHandler({
          eventName: 'new-user-signal',
          key: 'targetUserSocket',
          shouldBeSilent: true,
        });
        createTest({
          eventType: EventType.NewSaleSuccess,
          bodyBuilder(this: Context) {
            return {
              subscriptionId,
              timestamp,
              transactionId,
              dynamicPricingValidationDigest,
              flexId,
              'X-metadata': createMetadata({
                targetUserId: this.targetUser._id,
                userId: this.user._id,
              }),
            };
          },
        });
        before(async function (this: Context) {
          const user = await User
            .findById(this.user._id)
            .select('subscriptions activeSubscriptionsCounter subscriptionsCounter')
            .lean();
          this.userSubscriptions = user.subscriptions;
          this.userActiveSubscriptionsCounter = user.activeSubscriptionsCounter;
          this.userSubscriptionsCounter = user.subscriptionsCounter;
        });
        before(async function (this: Context) {
          const targetUser = await User.findById(this.targetUser._id).select('subscribers subscribersCounter').lean();
          this.targetUserSubscribers = targetUser.subscribers;
          this.targetUserSubscribersCounter = targetUser.subscribersCounter;
        });
        it('should contain new subscription data', function () {
          expect(specHelper.maskPaths(this.userSubscriptions, ['targetUser'])).matchSnapshot(this);
        });
        it('userActiveSubscriptionsCounter should be 1', function () {
          expect(this.userActiveSubscriptionsCounter).to.be.equal(1);
        });
        it('userSubscriptionsCounter should be 1', function () {
          expect(this.userSubscriptionsCounter).to.be.equal(1);
        });
        it('should contain user in subscribers', function () {
          expect(this.targetUserSubscribers.length).equal(1);
          expect(this.targetUserSubscribers[0].toHexString()).equal(this.user._id);
          expect(this.targetUserSubscribersCounter).equal(1);
        });
      });

      describe('new deposit', () => {
        specHelper.withUserSocket({
          key: 'userSocket',
          userKey: 'user',
        });
        createTest({
          eventType: EventType.NewSaleSuccess,
          bodyBuilder(this: Context) {
            return {
              subscriptionId,
              timestamp,
              transactionId,
              dynamicPricingValidationDigest,
              flexId,
              billedInitialPrice: '20.00',
              'X-metadata': createMetadata({
                isDeposit: true,
                userId: this.user._id,
              }),
            };
          },
        });
        before(async function (this: Context) {
          const user = await User
            .findById(this.user._id)
            .select('balance')
            .lean();
          this.balance = user.balance;
        });
        it('should new balancerecord to be created', async function () {
          const balanceRecord = await BalanceRecord.findOne({
            owner: this.user._id,
            type: BalanceRecordType.Deposit,
            refModel: BalanceRecordRefModel.Deposit,
            sum: 20,
          }).lean();

          expect(specHelper.maskPaths(balanceRecord, ['owner', '_id', 'createdAt'])).matchSnapshot(this);
        });
        it('balance should be increased to billedInitialPrice value', function () {
          expect(this.balance).to.be.equal(1020);
        });
      });

      describe('another subscription', () => {
        specHelper.withUser({
          key: 'user',
        });
        specHelper.withUser({
          key: 'targetUser',
        });
        before(function (this: Context) {
          return User.updateOne(
            {
              _id: this.user._id,
            },
            {
              $push: {
                subscriptions: {
                  active: false,
                  billing: {
                    subscriptionId: '888888',
                    transactionId: '80983240932840932',
                    purchasedTimestamp: '2015‐01‐01 13:00:00',
                  },
                  targetUser: this.targetUser._id,
                },
              },
            },
          );
        });
        createTest({
          eventType: EventType.NewSaleSuccess,
          bodyBuilder(this: Context) {
            return {
              subscriptionId,
              timestamp,
              transactionId,
              dynamicPricingValidationDigest,
              flexId,
              'X-metadata': createMetadata({
                targetUserId: this.targetUser._id,
                userId: this.user._id,
              }),
            };
          },
        });
        before(async function (this: Context) {
          const user = await User.findById(this.user._id).select('subscriptions subscriptionsCounter').lean();
          this.userSubscriptions = user.subscriptions;
          this.userSubscriptionsCounter = user.subscriptionsCounter;
        });
        it('should contain new subscription data', function () {
          expect(specHelper.maskPaths(this.userSubscriptions, ['targetUser'])).matchSnapshot(this);
        });
        it('userSubscriptionsCounter should be 1', function () {
          expect(this.userSubscriptionsCounter).to.be.equal(1);
        });
      });

      describe('with wrong digest', () => {
        createTest({
          eventType: EventType.NewSaleSuccess,
          body: {
            subscriptionId,
            timestamp,
            transactionId,
            dynamicPricingValidationDigest: 'wrong',
            flexId,
            'X-metadata': createMetadata({
              targetUserId: '1',
              userId: '2',
            }),
          },
        });
      });
      describe('with wrong flexId', () => {
        createTest({
          eventType: EventType.NewSaleSuccess,
          body: {
            subscriptionId,
            timestamp,
            transactionId,
            dynamicPricingValidationDigest,
            flexId: 'wrong',
            'X-metadata': createMetadata({
              targetUserId: '1',
              userId: '2',
            }),
          },
        });
      });
      describe('with no metadata', () => {
        createTest({
          eventType: EventType.NewSaleSuccess,
          body: {
            subscriptionId,
            timestamp,
            transactionId,
            dynamicPricingValidationDigest,
            flexId,
          },
        });
      });
      describe('with wrong user id', () => {
        createTest({
          eventType: EventType.NewSaleSuccess,
          body: {
            subscriptionId,
            timestamp,
            transactionId,
            dynamicPricingValidationDigest,
            flexId,
            'X-metadata': createMetadata({
              targetUserId: '1',
              userId: '2',
            }),
          },
        });
      });
      describe('with no targetUser', () => {
        specHelper.withUser();
        const wrongTargetUserId = '5eba41ca8db04867f35599da';
        createTest({
          eventType: EventType.NewSaleSuccess,
          bodyBuilder(this: Context) {
            return {
              subscriptionId,
              timestamp,
              transactionId,
              dynamicPricingValidationDigest,
              flexId,
              'X-metadata': createMetadata({
                targetUserId: wrongTargetUserId,
                userId: this.user._id,
              }),
            };
          },
        });
      });
      describe('with no user', () => {
        specHelper.withUser();
        const wrongUserId = '5eba40c96a30af65f66ead12';
        createTest({
          eventType: EventType.NewSaleSuccess,
          bodyBuilder(this: Context) {
            return {
              subscriptionId,
              timestamp,
              transactionId,
              dynamicPricingValidationDigest,
              flexId,
              'X-metadata': createMetadata({
                targetUserId: this.user._id,
                userId: wrongUserId,
              }),
            };
          },
        });
      });
    });
    describe('NewSaleFailure', () => {
      // It's how it should be built
      // crypto
      //   .createHash('md5')
      //   .update(([denialId, 0, salt].join('')))
      //   .digest('hex');
      const dynamicPricingValidationDigest = 'not checked ATM';
      const failureCode = 'BE-140';
      const failureReason = 'Invalid Input.';

      describe('new subscription', () => {
        specHelper.withUserSocket({
          key: 'userSocket',
          userKey: 'user',
        });
        specHelper.withUserSocket({
          key: 'targetUserSocket',
          userKey: 'targetUser',
        });
        specHelper.withSocketHandler({
          eventName: 'new-user-signal',
          makeSnapShot: {
            mask: ['data.recipients'],
          },
        });
        specHelper.withSocketHandler({
          eventName: 'new-user-signal',
          key: 'targetUserSocket',
          shouldBeSilent: true,
        });
        createTest({
          eventType: EventType.NewSaleFailure,
          bodyBuilder(this: Context) {
            return {
              subscriptionId,
              timestamp,
              transactionId,
              dynamicPricingValidationDigest,
              flexId,
              failureCode,
              failureReason,
              'X-metadata': createMetadata({
                targetUserId: this.targetUser._id,
                userId: this.user._id,
              }),
            };
          },
        });
        before(async function (this: Context) {
          const user = await User.findById(this.user._id).select('subscriptions').lean();
          this.userSubscriptions = user.subscriptions;
        });
        before(async function (this: Context) {
          const targetUser = await User.findById(this.targetUser._id).select('subscribers').lean();
          this.targetUserSubscribers = targetUser.subscribers;
        });
        it('should not add subscription data', function () {
          expect(this.userSubscriptions.length).equal(0);
        });
        it('should not contain user in subscribers', function () {
          expect(this.targetUserSubscribers.length).equal(0);
        });
      });

      describe('with wrong flexId', () => {
        createTest({
          eventType: EventType.NewSaleFailure,
          body: {
            subscriptionId,
            timestamp,
            transactionId,
            dynamicPricingValidationDigest,
            flexId: 'wrong',
            failureReason,
            failureCode,
            'X-metadata': createMetadata({
              targetUserId: '1',
              userId: '2',
            }),
          },
        });
      });
      describe('with no metadata', () => {
        createTest({
          eventType: EventType.NewSaleFailure,
          body: {
            subscriptionId,
            timestamp,
            transactionId,
            dynamicPricingValidationDigest,
            flexId,
            failureCode,
            failureReason,
          },
        });
      });
      describe('with no user', () => {
        specHelper.withUser();
        createTest({
          eventType: EventType.NewSaleFailure,
          bodyBuilder(this: Context) {
            return {
              subscriptionId,
              timestamp,
              transactionId,
              dynamicPricingValidationDigest,
              flexId,
              failureCode,
              failureReason,
              // @ts-ignore for testing purposes
              'X-metadata': createMetadata({
                targetUserId: this.user._id,
              }),
            };
          },
        });
      });
    });

    const createCancellationTest = (eventType: EventType, isExisting: boolean) => {
      const cancelingTimestamp = '2012‐08‐05 15:18:17';
      const thisSubscription: UserSubscription = {
        active: true,
        targetUser: 'TBD',
        billing: {
          subscriptionId,
          transactionId,
          purchasedTimestamp: timestamp,
        },
      };
      const otherSubscription: UserSubscription = {
        active: true,
        targetUser: '5eba41ca8db04867f3550000',
        billing: {
          subscriptionId: '9999999999',
          transactionId: '0000000000000000000',
          purchasedTimestamp: timestamp,
        },
      };
      describe(isExisting ? 'existing subscription' : 'not existing subscription', () => {
        specHelper.withUserSocket({
          key: 'userSocket',
          userKey: 'user',
        });
        if (isExisting) {
          specHelper.withUser({
            key: 'targetUser',
          });
        }
        if (isExisting) {
          specHelper.withSocketHandler({
            eventName: 'new-user-signal',
            makeSnapShot: {
              mask: ['data.recipients'],
            },
          });
        } else {
          specHelper.withSocketHandler({
            eventName: 'new-user-signal',
            shouldBeSilent: true,
          });
        }
        before(async function (this: Context) {
          let subscriptions: UserSubscription[];
          if (isExisting) {
            subscriptions = [
              otherSubscription,
              thisSubscription,
            ];
            thisSubscription.targetUser = this.targetUser._id;
          } else {
            subscriptions = [
              otherSubscription,
            ];
          }
          this.activeSubscriptionsCounterBefore = subscriptions
            .filter(({ active }) => active).length;
          this.subscriptionsCounterBefore = subscriptions.length;
          await User.updateOne(
            { _id: this.user._id },
            {
              subscriptions,
              activeSubscriptionsCounter: this.activeSubscriptionsCounterBefore,
              subscriptionsCounter: this.subscriptionsCounterBefore,
            },
          );
          if (isExisting) {
            await User.updateOne(
              { _id: this.targetUser._id },
              {
                $push: {
                  subscribers: this.user._id,
                },
              },
            );
          }
        });
        createTest({
          eventType,
          body: {
            subscriptionId,
            timestamp: cancelingTimestamp,
          },
        });
        before(async function (this: Context) {
          const user = await User
            .findById(this.user._id)
            .select('subscriptions activeSubscriptionsCounter subscriptionsCounter')
            .lean();
          this.userSubscriptions = user.subscriptions;
          this.userActiveSubscriptionsCounter = user.activeSubscriptionsCounter;
          this.userSubscriptionsCounter = user.subscriptionsCounter;
        });
        if (isExisting) {
          before(async function (this: Context) {
            const targetUser = await User.findById(this.targetUser._id).select('subscribers').lean();
            this.targetUserSubscribers = targetUser.subscribers;
          });
        }
        it('should not add subscription data', function () {
          expect(specHelper.maskPaths(
            this.userSubscriptions,
            ['targetUser'],
          )).matchSnapshot(this);
        });
        if (isExisting) {
          it('should not contain user in subscribers', function () {
            expect(this.targetUserSubscribers.length).equal(0);
          });
          it('userActiveSubscriptionsCounter should decrease', function () {
            expect(this.userActiveSubscriptionsCounter).to.be.equal(
              this.activeSubscriptionsCounterBefore - 1,
            );
          });
          it('userSubscriptionsCounter not should decrease', function () {
            expect(this.userSubscriptionsCounter).to.be.equal(this.subscriptionsCounterBefore);
          });
        } else {
          it('userActiveSubscriptionsCounter should be the same', function () {
            expect(this.userActiveSubscriptionsCounter).to.be.equal(
              this.activeSubscriptionsCounterBefore,
            );
          });
          it('userSubscriptionsCounter should be the same', function () {
            expect(this.userSubscriptionsCounter).to.be.equal(this.subscriptionsCounterBefore);
          });
        }
      });
    };

    describe('Cancellation', () => {
      createCancellationTest(EventType.Cancellation, true);
      createCancellationTest(EventType.Cancellation, false);
    });

    describe('Expiration', () => {
      createCancellationTest(EventType.Expiration, true);
      createCancellationTest(EventType.Expiration, false);
    });

    describe('failed validation', () => {
      describe('with wrong secret', () => {
        createTest({
          url: `${testConfig.baseUrl}/billing/webhook/badSecret`,
        });
      });
      describe('without account data', () => {
        createTest({
          url: `${testConfig.baseUrl}/billing/webhook/${webhookSecret}`,
        });
      });
      describe('with wrong account', () => {
        createTest({
          url: `${testConfig.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=wrong&clientSubacc=${clientSubacc}&eventType=${ICcBill.EventType.NewSaleSuccess}`,
        });
      });
      describe('with wrong subaccount', () => {
        createTest({
          url: `${testConfig.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=${clientAccnum}&clientSubacc=wrong&eventType=${ICcBill.EventType.NewSaleSuccess}`,
        });
      });
      describe('with wrong eventType', () => {
        createTest({
          url: `${testConfig.baseUrl}/billing/webhook/${webhookSecret}?clientAccnum=${clientAccnum}&clientSubacc=${clientSubacc}&eventType=wrong`,
        });
      });
    });
  });
});
