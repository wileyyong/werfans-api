import { Document } from 'mongoose';

export interface ClientDomain {
  name: string;
  clientId: string;
  clientSecret: string;
}

export interface ClientDocument extends ClientDomain, Document {
}

export interface RefreshTokenDocument extends Document {
  user: string;
  client: string;
  token: string;
  scopes: string;
  createdAt: string;
}

export interface AccessTokenPayload {
  user: string;
  client: string;
  scopes?: string;
}

export interface AuthResource {
  access_token: string;
  refresh_token: string;
}
