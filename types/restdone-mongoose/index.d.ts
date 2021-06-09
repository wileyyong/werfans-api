declare module 'restdone-mongoose' {
  import { Document, Model } from 'mongoose';
  import { DataSource } from 'restdone';

  interface MongooseDataSource<D extends Document, T> extends DataSource<D, T> {
    ModelClass: Model<D>;
  }
}
