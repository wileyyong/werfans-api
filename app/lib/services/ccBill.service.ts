import crypto from 'crypto';
import querystring from 'querystring';
import { App } from '../../domains/app';
import { ICcBill } from '../../domains/ICcBill';
import { SignalType } from '../../domains/notification';
import { BalanceRecordType } from '../../domains/balanceRecord';
import { BalanceRecordRefModel } from '../../domains/balanceRecordRefModel';

import EventType = ICcBill.EventType;

export class CcBillService implements ICcBill.IService {
  app?: App;

  init(app: App) {
    app.registerProvider('ccBillService', this);
    this.app = app;
  }

  async generateFormUrl(
    params: ICcBill.GenerateUrlParams,
    metadataObj: ICcBill.Metadata,
  ): Promise<string> {
    const metadata = this.toBase64(JSON.stringify(metadataObj));
    const formData: ICcBill.DynamicFormData = {
      initialPrice: params.price,
      initialPeriod: params.period,
      currencyCode: ICcBill.CurrencyCode.USD,
      metadata,
    };

    if (!metadataObj.isDeposit) {
      Object.assign(formData, {
        recurringPrice: params.price,
        recurringPeriod: params.period,
        numRebills: '99',
      });
    }

    const {
      config: {
        billing: {
          clientAccnum,
          clientSubacc,
          endpoint,
          flexId,
          salt,
        },
      },
    } = this.app!;

    const formDigest = this.createHash(formData, salt);

    return `${endpoint}/${flexId}?${querystring.stringify({
      ...formData,
      clientAccnum,
      formDigest,
      clientSubacc,
    })}`;
  }

  private createHash(data: ICcBill.DynamicFormData, salt: string) {
    let toHash;
    if ((<ICcBill.RecurringDynamicFormData>data).recurringPeriod) {
      const recurringDynamicFormData = <ICcBill.RecurringDynamicFormData>data;
      toHash = [
        recurringDynamicFormData.initialPrice,
        recurringDynamicFormData.initialPeriod,
        recurringDynamicFormData.recurringPrice,
        recurringDynamicFormData.recurringPeriod,
        recurringDynamicFormData.numRebills,
        recurringDynamicFormData.currencyCode,
        salt,
      ];
    } else {
      toHash = [
        data.initialPrice,
        data.initialPeriod,
        data.currencyCode,
        salt,
      ];
    }

    return this.toMd5(toHash.join(''));
  }

  handleEvent(eventType: ICcBill.EventType, event: ICcBill.WebhookInDto): Promise<unknown> {
    if (eventType === EventType.NewSaleSuccess) {
      return this.onNewSaleSuccess(<ICcBill.NewSaleSuccessEvent>event);
    } else if (eventType === EventType.NewSaleFailure) {
      return this.onNewSaleFailure(<ICcBill.NewSaleFailureEvent>event);
    } else if (eventType === EventType.Cancellation) {
      return this.onCancellation(<ICcBill.CancellationEvent>event);
    } else if (eventType === EventType.Expiration) {
      return this.onExpiration(<ICcBill.ExpirationEvent>event);
    } else {
      throw new Error(`Unknown event: ${eventType}`);
    }
  }

  private async onNewSaleSuccess(event: ICcBill.NewSaleSuccessEvent) {
    const { salt, testingMode } = this.app!.config.billing;
    const {
      subscriptionId,
      timestamp,
      transactionId,
      dynamicPricingValidationDigest,
      billedInitialPrice,
    } = event;

    if (!testingMode) {
      const calculatedDigest = this.toMd5([subscriptionId, 1, salt].join(''));
      if (calculatedDigest !== dynamicPricingValidationDigest) {
        throw new Error('Wrong digest');
      }
    }
    const { userId, targetUserId, isDeposit } = this.extractNewSaleData(event);

    if (isDeposit) {
      await this.applyDeposit(userId, parseFloat(billedInitialPrice));
    } else {
      if (!targetUserId) {
        throw new Error('Incorrect target user id');
      }
      const subscription = {
        active: true,
        billing: {
          subscriptionId,
          transactionId,
          purchasedTimestamp: timestamp,
        },
        targetUser: targetUserId,
      };
      await this.applySubscription(userId, targetUserId, subscription);
      await this.notifyNewSaleResult({ userId, payload: { result: true, targetUserId } });
    }
  }

  private async onNewSaleFailure(event: ICcBill.NewSaleFailureEvent) {
    const { failureCode, failureReason } = event;
    const { userId } = this.extractNewSaleData(event);
    if (!userId) {
      throw new Error('No user ID provided');
    }
    await this.notifyNewSaleResult({
      userId,
      payload: { result: false, errorMessage: `${failureCode}: ${failureReason}` },
    });
  }

  private async onCancellation(event: ICcBill.CancellationEvent) {
    const { subscriptionId, timestamp } = event;
    const user = await this.cancelSubscription(subscriptionId, timestamp);
    await this.notifyCancel({
      userId: user._id,
    });
  }

  private async onExpiration(event: ICcBill.ExpirationEvent) {
    return this.onCancellation(event);
  }

  private extractNewSaleData(
    event: ICcBill.NewSaleSuccessEvent | ICcBill.NewSaleFailureEvent,
  ): ICcBill.Metadata {
    const { flexId, 'X-metadata': metadataEncoded } = event;
    if (flexId !== this.app!.config.billing.flexId) {
      throw new Error(`Wrong flexId: ${flexId}`);
    }
    if (!metadataEncoded) {
      throw new Error('no metadata provided');
    }
    const metadataStr = this.fromBase64(metadataEncoded);
    return <ICcBill.Metadata>JSON.parse(metadataStr);
  }

  private fromBase64(base64: string) {
    return Buffer
      .from(base64, 'base64')
      .toString('ascii');
  }

  private toBase64(str: string) {
    return Buffer
      .from(str, 'ascii')
      .toString('base64');
  }

  private toMd5(str: string) {
    return crypto
      .createHash('md5')
      .update(str)
      .digest('hex');
  }

  private async applyDeposit(userId: string, billedInitialPrice:number) {
    const { paymentService } = this.app!;

    return paymentService.processRecord({
      owner: userId,
      type: BalanceRecordType.Deposit,
      refModel: BalanceRecordRefModel.Deposit,
      sum: billedInitialPrice,
    });
  }

  private async applySubscription(
    userId: string,
    targetUserId: string,
    subscriptionObj: Record<string, any>,
  ) {
    const { modelProvider: { User } } = this.app!;
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
      throw new Error(`Wrong targetUser: ${targetUserId}`);
    }
    const result = await User.updateOne(
      { _id: userId },
      { $pull: { subscriptions: { targetUser: targetUserId } } },
    );
    if (result.nModified <= 0) {
      throw new Error(`Wrong user: ${userId}`);
    }
    await User.updateOne(
      { _id: userId },
      { $push: { subscriptions: subscriptionObj } },
    );
    await User.syncSubscriptionsCounters(userId);
    targetUser.subscribers.addToSet(userId);
    targetUser.subscribersCounter = targetUser.subscribers.length;
    return targetUser.save();
  }

  private async cancelSubscription(subscriptionId: string, timestamp: string) {
    const { modelProvider: { User } } = this.app!;
    const user = await User.findOneAndUpdate(
      { 'subscriptions.billing.subscriptionId': subscriptionId },
      { $set: { 'subscriptions.$.active': false, 'subscriptions.$.billing.canceledTimestamp': timestamp } },
    );
    if (!user) {
      throw new Error(`Cannot find a user for subscription: ${subscriptionId}`);
    }

    await User.syncSubscriptionsCounters(user._id);

    const foundSubscription = user.subscriptions
      .find((subscription) => subscription.billing.subscriptionId === subscriptionId);

    await User.updateOne(
      { _id: foundSubscription!.targetUser },
      { $pull: { subscribers: user._id } },
    );
    return user;
  }

  private notifyNewSaleResult(
    params: { userId: string; payload: ICcBill.NotificationPayload; },
  ) {
    const { userId, payload } = params;
    this.app!.notificationService.createSignal({
      signalType: SignalType.PurchaseResult,
      recipients: [userId],
      data: payload,
    });
  }

  private notifyCancel(
    params: { userId: string; },
  ) {
    const { userId } = params;
    this.app!.notificationService.createSignal({
      signalType: SignalType.SubscriptionCanceled,
      recipients: [userId],
      data: {},
    });
  }
}

export default new CcBillService();
