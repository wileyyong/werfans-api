import { Document, Schema } from 'mongoose';
import app from 'app';
import banPlugin, { MongooseModelWithBan } from 'app/lib/restdone.plugin/ban.restdone.plugin';
import BaseController from '../base.restdone.controller';
import { Scope } from '../../domains/app';
import { StrikeDomain } from '../../domains/strike';
import { StrikeCreated } from '../../domains/molecules';
import validateSchema from '../validateSchema';

function mongooseFn(schema: Schema) {
  return banPlugin.mongoose(
    schema,
    {
      extraUnbanValues: { $unset: { suspendedAt: '', banningReasonType: '', banningReasonDescription: '' } },
    },
  );
}

export interface RestdoneOptions {
  Model: MongooseModelWithBan;
  targetUserFieldName?: string;
}

function restdoneFn(
  restdoneController: BaseController<any, any, any>,
  options: RestdoneOptions,
) {
  const {
    Model,
    targetUserFieldName = 'owner',
  } = options;

  const {
    consts: { events },
    modelProvider: { Strike },
    schemas: { banContentSchema },
  } = app;

  return banPlugin.restdone(restdoneController, {
    Model,
    async afterBan(doc: Document, scope: Scope) {
      const freshDoc = await Model.findById(doc._id).lean();
      if (freshDoc) {
        const strike = await Strike.create(<Partial<StrikeDomain>>{
          creator: scope.user!._id,
          ref: freshDoc._id,
          refModel: Model.modelName,
        });
        app.moleculerBroker.emit(events.strikes.created, <StrikeCreated>{
          _id: strike.id,
          targetUser: strike.targetUser,
        });
      }
    },
    exposeUnban: false,
    async getExtraBanValues(scope: Scope) {
      const { body } = scope;
      const {
        banningReasonType,
        banningReasonDescription,
      } = await validateSchema(body, banContentSchema);
      return { banningReasonType, banningReasonDescription };
    },
  });
}

const plugin = {
  mongoose: mongooseFn,
  restdone: restdoneFn,
};

export default plugin;
