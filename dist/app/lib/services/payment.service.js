"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentService = void 0;
class PaymentService {
    init(app) {
        app.registerProvider('paymentService', this);
        this.app = app;
    }
    processRecord(balanceRecord) {
        return __awaiter(this, void 0, void 0, function* () {
            const { BalanceRecord, User } = this.app.modelProvider;
            const balanceFilter = balanceRecord.sum < 0
                ? { balance: { $gte: -1 * balanceRecord.sum } }
                : {};
            const result = yield User.updateOne(Object.assign({ _id: balanceRecord.owner }, balanceFilter), { $inc: { balance: balanceRecord.sum } });
            if (result.nModified > 0) {
                const balanceRecordDoc = yield BalanceRecord.create(balanceRecord);
                this.app.moleculerBroker.emit(this.app.consts.events.payment.accepted, {
                    _id: balanceRecordDoc._id,
                    owner: balanceRecordDoc.owner,
                    type: balanceRecordDoc.type,
                    sum: balanceRecordDoc.sum,
                    ref: balanceRecordDoc.ref,
                    refModel: balanceRecordDoc.refModel,
                });
                return true;
            }
            else {
                return false;
            }
        });
    }
}
exports.PaymentService = PaymentService;
exports.default = new PaymentService();
//# sourceMappingURL=payment.service.js.map