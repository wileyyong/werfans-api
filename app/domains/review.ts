import { Document, Model, Types } from 'mongoose';
import { UserDocument } from './user';

export interface ReviewDomain {
  author: string;
  targetUser: string;
  rating: 1|2|3|4|5;
  body: string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ReviewModel extends Model<ReviewDocument> {
  calculateRating(targetUser: string | Types.ObjectId): Promise<number>;
}

export interface ReviewDocument extends Document, ReviewDomain {}

export interface ReviewResource extends Omit<ReviewDomain, 'author' | 'targetUser'> {
  _id: string;
  author: Pick<UserDocument, '_id' | 'username'>
  targetUser: Pick<UserDocument, '_id' | 'username'>
}
