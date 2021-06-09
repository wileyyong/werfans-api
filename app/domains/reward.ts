import { Document } from 'mongoose';

export interface RewardDomain {
  reward: string,
  description: string;
  period: string;
  place: number;
  createdAt: Date | string;
  updatedAt: Date | string;
}

export interface RewardDocument extends Document, RewardDomain {

}

export interface RewardResource {
  _id: string;
}
