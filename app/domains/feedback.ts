import { Document } from 'mongoose';
import { UserDocument } from './user';

export enum FeedbackType {
  Suggestion = 'suggestion',
  SupportRequest = 'supportRequest'
}

export const FeedbackTypeValues: FeedbackType[] = Object
  .values(FeedbackType)
  .filter((x) => typeof x === 'string');

export interface FeedbackDomain {
  author: string;
  body: string;
  photoUrl: string;
  type: FeedbackType;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface FeedbackDocument extends Document, FeedbackDomain {}

export interface FeedbackResource extends Omit<FeedbackDomain, 'author'> {
  _id: string;
  author: Pick<UserDocument, '_id' | 'username'>
}
