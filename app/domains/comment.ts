import { Document } from 'mongoose';
import { UserDocument } from './user';

export enum CommentTargetModels {
  LiveStream = 'LiveStream'
}

export const CommentTargetValues: CommentTargetModels[] = Object
  .values(CommentTargetModels)
  .filter((x) => typeof x === 'string');

export const CommentRoutes = [{
  route: 'live-streams',
  targetModel: CommentTargetValues[0],
}];

export interface CommentDomain {
  author: string;
  target: string;
  targetModel: CommentTargetModels;
  body: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface CommentDocument extends Document, CommentDomain {}

export interface CommentResource extends Omit<CommentDomain, 'author'> {
  _id: string;
  author: Pick<UserDocument, '_id' | 'username'>
}
