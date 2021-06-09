import { App, IPaymentService } from '../../domains/app';
import { BalanceRecordDomain } from '../../domains/balanceRecord';
import { PaymentAccepted } from '../../domains/molecules';

export class PaymentService implements IPaymentService {
  app?: App;

  init(app: App) {
    app.registerProvider('paymentService', this);
    this.app = app;
  }

  async processRecord(balanceRecord: BalanceRecordDomain): Promise<boolean> {
    const { BalanceRecord, User } = this.app!.modelProvider;
    const balanceFilter = balanceRecord.sum < 0
      ? { balance: { $gte: -1 * balanceRecord.sum } }
      : {};
    const result = await User.updateOne(
      {
        _id: balanceRecord.owner,
        ...balanceFilter,
      },
      { $inc: { balance: balanceRecord.sum } },
    );
    if (result.nModified > 0) {
      const balanceRecordDoc = await BalanceRecord.create(balanceRecord);
      this.app!.moleculerBroker.emit<PaymentAccepted>(this.app!.consts.events.payment.accepted, {
        _id: balanceRecordDoc._id,
        owner: balanceRecordDoc.owner,
        type: balanceRecordDoc.type,
        sum: balanceRecordDoc.sum,
        ref: balanceRecordDoc.ref,
        refModel: balanceRecordDoc.refModel,
      });
      return true;
    } else {
      return false;
    }
  }
}

export default new PaymentService();
