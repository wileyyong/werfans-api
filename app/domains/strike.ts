import { Document } from 'mongoose';
import { UserDocument } from './user';

export enum StrikeState {
  Created ='created',
  Confirmed = 'confirmed',
  Revoked = 'revoked'
}

export const StrikeStateValues: StrikeState[] = Object
  .values(StrikeState)
  .filter((x) => typeof x === 'string');

export enum StrikeType {
  Abuse = 'abuse',
  Nudity ='nudity',
  Spam = 'spam',
  WrongAccountType = 'wrongAccountType'
}

export const StrikeTypeValues: StrikeType[] = Object
  .values(StrikeType)
  .filter((x) => typeof x === 'string');

export enum StrikeTargetModel {
  Album = 'Album',
  Message = 'Message',
  Photo = 'Photo',
  Video = 'Video'
}

export const StrikeTargetModelValues: StrikeTargetModel[] = Object
  .values(StrikeTargetModel)
  .filter((x) => typeof x === 'string');

export interface StrikeDomain {
  creator: string;
  targetUser: string;
  state: StrikeState;
  type: StrikeType;
  description?: string;
  ref?: string;
  refModel?: StrikeTargetModel;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface StrikeDocument extends Document, StrikeDomain {
  changeState(newState: StrikeState): boolean;
}

export interface StrikeResource extends Omit<StrikeDomain, 'creator'> {
  _id: string;
  creator: Pick<UserDocument, '_id' | 'username'>
}
