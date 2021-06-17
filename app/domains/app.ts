import { Server } from 'http';
import { ActionOptions, Controller as RestdoneController, Scope as RestdoneScope } from 'restdone';
import { Controller as ControldoneController } from 'controldone';
import { Document, Model, Schema } from 'mongoose';
import { LoggerInstance, ServiceBroker, ServiceSchema } from 'moleculer';
import { Application } from 'express';
import { Config } from 'config/env/all';
import SocketIO, { Handshake, Socket } from 'socket.io';
import { Consts } from '../lib/consts';
import { UserDocument, UserModel } from './user';
import { ClientDocument, RefreshTokenDocument } from './auth';
import { LiveStreamModel } from './liveStream';
import { AlbumModel } from './album';
import { NotificationDocument } from './notification';
import { SystemNotificationDocument } from './systemNotification';
import { GoalDocument } from './goal';
import { PhotoModel } from './photo';
import { RewardDocument } from './reward';
import { FeedbackDocument } from './feedback';
import { VideoModel } from './video';
import { StrikeDocument } from './strike';
import { ChatModel } from './chat';
import { CommentDocument } from './comment';
import { EmailBuilder, IEmailService } from './email';
import { MessageModel } from './message';
import { ReportDocument } from './report';
import { ExtendedExpressApplication } from './system';
import { ICcBill } from './ICcBill';
import { NotificationService } from '../lib/services/notification.service';
import { UserConfigDocument } from './userConfig';
import { ReviewModel } from './review';
import { Schemas } from '../schemas/app.schema';
import { BalanceRecordDomain, BalanceRecordModel } from './balanceRecord';

export type AuthOptions = string | string[];

export interface ExtendedActionOptions extends ActionOptions {
  auth: AuthOptions;
}

export interface IFfmpegService {
  extractCover(videoUrl: string, userId: string, outputScreenshotUrl?: string): Promise<string>;
}

export interface IPaymentService {
  processRecord(balanceRecord: BalanceRecordDomain): Promise<boolean>;
}

export interface Scope<M = any> extends RestdoneScope<M> {
  isResourceOwner(
    userId: Schema.Types.ObjectId | string,
    otherUserId: Schema.Types.ObjectId | string,
  ): boolean;
  overrideField(
    fieldName: string,
    value: any,
  ): void;
  getClient(): ClientDocument | null;
  getLocale(): string | null;
  getReferrer(): string | null;
  getSocket(): Socket | null;
  getUser(): UserDocument | null;
  setUser(user: UserDocument): void;
  _isAdminMode(): boolean;
  client: ClientDocument | null;
  locale: string | null;
  referrer: string | null;
  socket: Socket | null;
  user: UserDocument | null;
  isAdminMode: boolean;
}

export interface SocketHandshake extends Handshake {
  client: ClientDocument | null;
  user: UserDocument | null;
}

export type MiddlewareBuilder = (expressApp: ExtendedExpressApplication, app: App) => void;

export interface App {
  init(): Promise<void>;
  registerProvider<T>(name: string, provider: T | (() => T)): T;
  apiControllers: (typeof ControldoneController)[];
  ccBillService: ICcBill.IService;
  config: Config;
  consts: Consts;
  createLog: (module: NodeModule) =>  Console;
  emails: EmailBuilder<any>[],
  emailService: IEmailService,
  expressApp: Application;
  ffmpegService: IFfmpegService;
  httpServer: Server;
  middlewares: MiddlewareBuilder[]
  modelProvider: {
    Album: AlbumModel,
    BalanceRecord: BalanceRecordModel,
    Chat: ChatModel,
    Client: Model<ClientDocument>,
    Comment: Model<CommentDocument>,
    Goal: Model<GoalDocument>,
    Feedback: Model<FeedbackDocument>,
    LiveStream: LiveStreamModel,
    Message: MessageModel,
    Migration: Model<Document>,
    Notification: Model<NotificationDocument>,
    Photo: PhotoModel,
    RefreshToken: Model<RefreshTokenDocument>,
    Report: Model<ReportDocument>,
    Review: ReviewModel,
    Reward: Model<RewardDocument>,
    Strike: Model<StrikeDocument>,
    SystemNotification: Model<SystemNotificationDocument>,
    User: UserModel,
    UserConfig: Model<UserConfigDocument>,
    Video: VideoModel,
  };
  moleculerBroker: ServiceBroker;
  moleculerService: IMoleculerService;
  molecules: ((app: App) => ServiceSchema)[];
  notificationService: NotificationService;
  paymentService: IPaymentService;
  restControllers: (typeof RestdoneController)[];
  schemas: Schemas,
  sio: SocketIO.Server,
}

export interface IMoleculerService {
  startBrokerWithServices(serviceNames?: string[]): Promise<unknown>;
  stopBroker(): Promise<unknown>;
}
