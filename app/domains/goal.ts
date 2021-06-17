import { Document } from 'mongoose';
import { UserResource } from './user';

export enum GoalState {
  Active = 'active',
  Cancelled = 'cancelled',
  Expired = 'expired',
  Reached = 'reached'
}

export const GoalStateValues: GoalState[] = Object
  .values(GoalState)
  .filter((x) => typeof x === 'string');

export interface GoalDomain {
  owner: string;
  title: string;
  state: GoalState;
  liveStream: string;
  targetAmount: number;
  currentAmount: number;
  completedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface GoalDocument extends Document, GoalDomain {
  changeState(newState: GoalState): boolean;
}

export interface GoalResource extends Omit<GoalDomain, 'owner'> {
  _id: string;
  owner: Pick<UserResource, '_id' | 'username'>
}
