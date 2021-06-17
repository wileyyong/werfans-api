declare module 'mongoose-validator' {
  import { Document, SchemaTypeOpts } from 'mongoose';

  interface Options {
    validator: string | (<T extends Document>(this: T, name: any) => Promise<unknown>);
    message?: string;
    passIfEmpty?: boolean;
    arguments?: any;
  }

  export default function (options: Options): SchemaTypeOpts<any>['validate'];
}
