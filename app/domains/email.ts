import { NotificationType } from './notification';

export enum EmailType {
  EmailVerification = 'EmailVerification',
  ForgotPassword = 'ForgotPassword',
  Notification = 'Notification',
  ResetPassword = 'ResetPassword'
}

export interface EmailBuilder<P> {
  name: EmailType;
  templateName: string;
  buildData: (payload: P) => Record<string, any>;
  buildSubject: (payload: P) => string;
}

export interface EmailVerificationPayload {
  baseUrl: string;
  email: string;
  token: string;
}

export interface ForgotPasswordPayload {
  baseUrl: string;
  token: string;
  username: string;
}

export interface ResetPasswordPayload {
  username: string;
}

export interface NotificationPayload {
  username: string;
  notificationType: NotificationType;
  notificationBody: string;
  notificationMetadata: any;
}

export interface IEmailService {
  sendEmail<T>(emailType: EmailType, params: EmailParams<T>): Promise<boolean>;
}

export interface EmailParams<T> {
  email: string;
  locale?: string;
  payload: T;
}

export interface EmailData {
  subject: string;
  to: string;
  from: string;
  html: string;
}
