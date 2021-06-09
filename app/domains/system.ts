import { Application, Request } from 'express';
import { ControllerOptions } from 'restdone';
import { UserDocument } from './user';
import { ClientDocument } from './auth';

export type Es6Module<T> = { default: T };

export interface OAuthdone {
  [key: string]: any;
}

export interface ExtendedExpressApplication extends Application {
  oAuthdone: OAuthdone;
}

export interface ExtendedExpressRequest extends Request {
  getLocale(): string;
  isAuthenticated(): boolean;
  user: UserDocument | ClientDocument;
}

export interface AppControllerOptions extends ControllerOptions {
  expandForAdmin?: boolean;
}
