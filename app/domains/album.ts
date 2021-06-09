import { Document, Model } from 'mongoose';
import { UserDocument } from './user';
import { Banning, BanningModel } from './banning';
import { StrikeType } from './strike';

export interface AlbumDomain extends Banning<StrikeType> {
  name: string,
  coverUrl?: string;
  price: number;
  photosCounter: number;
  viewsCounter: number;
  owner: string;
  suspendedAt?: Date | string;
  favoritedUsers: string[];
  favoritedUsersCounter: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface AlbumDocument extends Document, AlbumDomain {

}

export interface AlbumModel extends BanningModel, Model<AlbumDocument> {
  incPhotoCounter(id: string, value: number): Promise<AlbumDocument>;
  findFavoriteAlbumsForUser(userId: string): Promise<string[]>;
}

export interface AlbumResource extends Omit<AlbumDomain, 'owner' | 'favoritedUsers'> {
  _id: string;
  favoritedUsers: Pick<UserDocument, '_id' | 'username' | 'type' | 'avatarUrl'>
  owner: Pick<UserDocument, '_id' | 'username'>
}
