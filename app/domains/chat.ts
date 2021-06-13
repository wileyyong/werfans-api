import { Document, Model } from 'mongoose';
import { UserDocument } from './user';

export enum ChatType {
  Private = 'private',
  LiveStream = 'liveStream'
}

export const ChatTypeValues: ChatType[] = Object
  .values(ChatType)
  .filter((x) => typeof x === 'string');

export interface ChatDomain {
  chatType: ChatType,
  metadata?: any,
  name?: string,
  participants: string[];
  messagesCounter: number;
  unreadMessagesCounter: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface ChatDocument extends Document, ChatDomain {
  removeDependencies(): Promise<void>;
}

export interface ChatModel extends Model<ChatDocument> {
  createLiveStream(liveStreamId: string, ownerId: string): Promise<ChatDocument>;
  countUnreadMessages(chats: ChatDocument[], user: string | UserDocument): Promise<ChatDocument[]>;
  incMessageCounter(id: string, value: number): Promise<ChatDocument>;
  removeDependencies(id: string): Promise<void>;
}

export interface ChatResource extends ChatDomain {
  _id: string;
}
