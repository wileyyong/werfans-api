import { Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { BalanceRecordRefModel } from './balanceRecordRefModel';

export enum BalanceRecordType {
  GoalReached = 'GoalReached',
  LoadBalance = 'LoadBalance',
  PurchaseContent = 'PurchaseContent',
  Reverting = 'Reverting',
  Sale = 'Sale',
  SendTip = 'SendTip',
  Deposit = 'Deposit'
}

export const BalanceRecordTypeValues: BalanceRecordType[] = Object
  .values(BalanceRecordType)
  .filter((x) => typeof x === 'string');

export interface BalanceRecordDomain {
  owner: string;
  type: BalanceRecordType;
  sum: number;
  ref?: string;
  refModel?: BalanceRecordRefModel;
  createdAt?: Date | string;
  processedAt?: Date | string;
}

export interface BalanceRecordDocument extends Document, BalanceRecordDomain {
}

export interface BalanceRecordModel extends Model<BalanceRecordDocument> {
  markProcessed(id: string): Promise<void>;
}

export interface BalanceRecordResource extends Omit<BalanceRecordDomain, 'owner'> {
  _id: string;
  owner: Pick<UserDocument, '_id' | 'username'>
}
