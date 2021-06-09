import { Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { Banning, BanningModel } from './banning';
import { StrikeType } from './strike';

type Range = 0 | 1 | 2 | 3 | 4 | 5 | null;

export interface VideoDomain extends Banning<StrikeType> {
  owner: string,
  name: string,
  description?: string,
  price?: number;
  duration?: number;
  watermarkUrl?: string;
  watermarkOpacity?: Range;
  coverUrl?: string;
  url: string;
  publicUrl: string;
  viewsCounter: number;
  commentsCounter: number;
  suspendedAt?: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface VideoDocument extends Document, VideoDomain {

}

export interface VideoModel extends BanningModel, Model<VideoDocument> {
}

export interface VideoResource extends Omit<VideoDomain, 'owner'> {
  _id: string;
  owner: Pick<UserDocument, '_id' | 'username'>
}
