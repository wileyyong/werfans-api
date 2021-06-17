import BaseController from 'app/lib/base.restdone.controller';
import { Document, Model as MongooseModel, Schema } from 'mongoose';
import { Scope } from '../../domains/app';

type BanFunction = (
  id: string | Schema.Types.ObjectId,
  extraValues?: Record<string, any>,
) => Promise<unknown>;
type UnbanFunction = (id: string | Schema.Types.ObjectId) => Promise<unknown>;

export interface MongooseModelWithBan extends MongooseModel<Document> {
  ban: BanFunction;
  unban: UnbanFunction;
}

export interface MongooseOptions {
  fieldName?: string;
  extraBanValues?: Record<string, any>;
  extraUnbanValues?: Record<string, any>;
}

function mongooseFn(schema: Schema, options: MongooseOptions = {}) {
  const { fieldName = 'suspendedAt', extraBanValues, extraUnbanValues } = options;
  const fieldOpt = {
    [fieldName]: Date,
  };

  schema.add(fieldOpt);

  schema.statics.ban = async function ban(
    id: string | Schema.Types.ObjectId,
    extraValues: Record<string, any> = {},
  ): Promise<boolean> {
    const { nModified } = await this.updateOne(
      { _id: id },
      { [fieldName]: new Date(), ...extraBanValues, ...extraValues },
    );
    return nModified > 0;
  };

  schema.statics.unban = async function unban(
    id: string | Schema.Types.ObjectId,
  ): Promise<boolean> {
    const { nModified } = await this.updateOne(
      { _id: id },
      { $unset: { [fieldName]: '' }, ...extraUnbanValues },
    );
    return nModified > 0;
  };
}

export interface RestdoneOptions {
  Model: MongooseModelWithBan;
  afterBan?: (doc: Document, scope: Scope) => Promise<unknown>;
  afterUnban?: (doc: Document, scope: Scope) => Promise<unknown>;
  banPrecondition?: (document: Document) => Promise<boolean>;
  exposeUnban?: boolean;
  getExtraBanValues?: (scope: Scope) => Promise<Record<string, any>>;
}

function restdoneFn(
  restdoneController: BaseController<any, any, any>,
  options: RestdoneOptions,
) {
  const {
    Model,
    afterBan = async () => {},
    afterUnban = async () => {},
    exposeUnban = true,
    banPrecondition = async () => true,
    getExtraBanValues = () => Promise.resolve({}),
  } = options;

  if (!Model) {
    throw new Error('Model is not provided');
  }

  function pre(scope: Scope) {
    restdoneController.requireAdmin(scope);
  }

  restdoneController.actions.ban = restdoneController.normalizeAction({
    method: 'post',
    path: ':_id/ban',
    pre,
    handler: async function handler(scope: Scope) {
      const { params: { _id: id } } = scope;
      const extraValues = await getExtraBanValues(scope);
      const document = await this.locateModel(scope);
      const preconditionResult = await banPrecondition(document);
      if (preconditionResult) {
        await Model.ban(id, extraValues);
        await afterBan(document, scope);
      }
      return undefined;
    },
  }, 'ban');

  if (exposeUnban) {
    restdoneController.actions.unban = restdoneController.normalizeAction({
      method: 'post',
      path: ':_id/unban',
      pre,
      handler: async function banHandler(scope: Scope) {
        const { params: { _id: id } } = scope;
        await this.locateModel(scope);
        await Model.unban(id);
        await afterUnban(id, scope);
        return undefined;
      },
    }, 'unban');
  }
}

const plugin = {
  mongoose: mongooseFn,
  restdone: restdoneFn,
};

export default plugin;
