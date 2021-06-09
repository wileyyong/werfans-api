import { Document, Model, Types } from 'mongoose';
import { Banning, BanningModel } from './banning';
import { StrikeType } from './strike';

export interface MessageDomain extends Banning<StrikeType> {
  chat: string,
  author: string;
  body: string,
  unread: string[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface MessageDocument extends Document, Omit<MessageDomain, 'author'> {
  author: Types.ObjectId;
  wasNew: boolean;
  removeDependencies(): Promise<void>;
}

export interface MessageModel extends BanningModel, Model<MessageDocument> {
  removeDependencies(id: string): Promise<void>;
  removeFromUnread(id: string): Promise<void>;
}

export interface MessageResource extends MessageDomain {
  _id: string;
}
