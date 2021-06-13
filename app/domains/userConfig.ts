import { Document } from 'mongoose';

export interface UserConfigDomain {
  user: string;
  key: string;
  data: any;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface UserConfigDocument extends Document, UserConfigDomain {}

export interface UserConfigResource extends UserConfigDomain {
  _id: string;
}
