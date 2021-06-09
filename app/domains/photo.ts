import { Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { AlbumDocument } from './album';
import { Banning, BanningModel } from './banning';
import { StrikeType } from './strike';

type Range = 0 | 1 | 2 | 3 | 4 | 5 | null;

export interface PhotoDomain extends Banning<StrikeType> {
  name: string,
  description?: string,
  isCover?: boolean;
  watermarkUrl?: string;
  watermarkOpacity?: Range;
  blurIntensity?: Range;
  url: string;
  publicUrl: string;
  owner: string;
  album: string;
  viewsCounter: number;
  suspendedAt?: Date | string;
  favoritedUsers: string[];
  favoritedUsersCounter: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface PhotoDocument extends Document, PhotoDomain {
  wasNew: boolean;
}

export interface PhotoResource extends Omit<PhotoDomain, 'album' | 'owner' | 'favoritedUsers'> {
  _id: string;
  owner: Pick<UserDocument, '_id' | 'username'>
  favoritedUsers: Pick<UserDocument, '_id' | 'username' | 'type' | 'avatarUrl'>
  album: Pick<AlbumDocument, '_id' | 'name'>
}

export interface PhotoModel extends BanningModel, Model<PhotoDocument> {
  findFavoritePhotosForUser(userId: string): Promise<string[]>;
}
