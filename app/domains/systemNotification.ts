import { Document } from 'mongoose';
import { UserDocument } from './user';
import { NotificationType } from './notification';

export interface SystemNotificationDomain {
  author: string;
  notificationType: NotificationType;
  sentAt: Date | string;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface SystemNotificationDocument extends Document, SystemNotificationDomain {}

export interface SystemNotificationResource extends Omit<SystemNotificationDomain, 'author'> {
  _id: string;
  author: Pick<UserDocument, '_id' | 'username'>
}
