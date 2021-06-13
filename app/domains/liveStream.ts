import { Document, Model } from 'mongoose';
import { UserDocument } from './user';

export enum LiveStreamState {
  Created = 'created',
  Scheduled = 'scheduled',
  OnAir = 'onAir',
  Completed = 'completed'
}

export const LiveStreamStateValues: LiveStreamState[] = Object
  .values(LiveStreamState)
  .filter((x) => typeof x === 'string');

export interface LiveStreamDomain {
  duration: number,
  price: number;
  coverUrl?: string;
  url?: string;
  publicUrl?: string;
  owner: string;
  state: LiveStreamState;
  likedUsers: string[];
  likedUsersCounter: number;
  favoritedUsers: string[];
  favoritedUsersCounter: number;
  viewers: string[];
  viewersCounter: number;
  viewsCounter: number;
  /**
   * When backend processed starting of the livestream (sent appropriate notifications)
   */
  startingProcessedAt?: number;
  /**
   * When it's supposed to get started
   */
  scheduledStartingAt: Date | string;
  scheduledAt: Date | string;
  startedAt: Date | string;
  stoppedAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface LiveStreamDocument extends Document, Omit<LiveStreamDomain, 'viewers'> {
  changeState(newState: LiveStreamState): boolean;
}

export interface LiveStreamModel extends Model<LiveStreamDocument> {
  findFavoriteLiveStreamsForUser(userId: string): Promise<string[]>;
}

export interface LiveStreamResource extends Omit<LiveStreamDomain, 'owner' | 'likedUsers' | 'viewers' | 'favoritedUsers'> {
  _id: string;
  likedUsers: Pick<UserDocument, '_id' | 'username' | 'type' | 'avatarUrl'>
  favoritedUsers: Pick<UserDocument, '_id' | 'username' | 'type' | 'avatarUrl'>
  owner: Pick<UserDocument, '_id' | 'username'>
}
