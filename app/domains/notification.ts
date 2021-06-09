import { Document } from 'mongoose';

export enum NotificationType {
  AlbumCreated = 'AlbumCreated',
  LiveStreamScheduled = 'LiveStreamScheduled',
  LiveStreamStarted = 'LiveStreamStarted',
  LiveStreamStarting = 'LiveStreamStarting',
  LiveStreamGoalChanged = 'LiveStreamGoalChanged',
  PhotoAdded = 'PhotoAdded',
  PrivateMessageReceived = 'PrivateMessageReceived',
  StrikeCreated = 'StrikeCreated',
  Testing = 'Testing',
  VideoUploaded = 'VideoUploaded'
}

export const NotificationTypeValues: NotificationType[] = Object
  .values(NotificationType)
  .filter((x) => typeof x === 'string');

export interface NotificationDomain<M = Record<string, any>> {
  notificationType: NotificationType;
  readable: boolean;
  recipients?: string[],
  unread?: string[],
  body: string,
  metadata: M,
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface NotificationDocument<
M = Record<string, any>
> extends Document, NotificationDomain<M> {

}

export interface NotificationResource<M = Record<string, any>>
  extends Omit<NotificationDomain<M>, 'recipients' | 'unread'> {
  _id: string;
}

export enum SignalType {
  PurchaseResult = 'PurchaseResult',
  SubscriptionCanceled = 'SubscriptionCanceled'
}

export interface Signal<T = Record<string, any>> {
  signalType: SignalType;
  recipients?: string[],
  data: T;
}
