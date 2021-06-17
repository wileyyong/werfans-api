import { StrikeTargetModel } from './strike';
import { BalanceRecordType } from './balanceRecord';
import { BalanceRecordRefModel } from './balanceRecordRefModel';

export interface LiveStreamCompleted {
  _id: string;
}

export interface StrikeCreated {
  _id: string;
  targetUser: string;
}

export interface PaymentAccepted {
  _id: string;
  owner: string;
  type: BalanceRecordType;
  sum: number;
  ref?: string;
  refModel?: BalanceRecordRefModel;
}

export interface StrikeRevoked {
  _id: string;
  targetUser: string;
  ref?: string;
  refModel?: StrikeTargetModel;
}
