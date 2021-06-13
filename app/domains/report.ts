import { Document } from 'mongoose';

import { UserDocument } from './user';

export interface ReportDomain {
  author: string;
  complainUser: string;
  body: string;
  photoUrl: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReportDocument extends Document, ReportDomain {}

export interface ReportResource extends Omit<ReportDomain, 'author' | 'complainUser'> {
  _id: string;
  author: Pick<UserDocument, '_id' | 'username'>
  complainUser: Pick<UserDocument, '_id' | 'username'>
}
