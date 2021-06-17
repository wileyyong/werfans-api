/**
 * Created by mk on 02/07/16.
 */

import { ActionOptions, Controller } from 'restdone';
import HTTP_STATUSES from 'http-status-node';
import { Model } from 'mongoose';
import { Scope } from '../../../domains/app';

export interface RestdoneOptions {
  field: string;
  idFieldName: string,
  path?: string;
  pre?: (scope: Scope) => Promise<unknown>,
  model: Model<any>,
  extraFieldNames?: string,
  afterInc?: (scope: Scope, resource: Record<string, any>) => Promise<unknown>,
}

function restdoneFn(restdoneController: Controller, options: RestdoneOptions) {
  const {
    field,
    path = field,
    idFieldName = '_id',
    pre,
    model,
    extraFieldNames = '',
    afterInc,
  } = options;

  if (!field) {
    throw new Error('"field" is required');
  }

  if (!model) {
    throw new Error('"model" is required');
  }

  if (!path) {
    throw new Error('"path" is required');
  }

  const action: ActionOptions = {
    method: 'post',
    path: `:${idFieldName}/inc/${path}`,
    async handler(scope: Scope) {
      const doc = await model
        .findOneAndUpdate(
          { [idFieldName]: scope.params[idFieldName] },
          { $inc: { [field]: 1 } },
          { new: true },
        )
        .select(`email ${extraFieldNames}`)
        .lean();
      if (!doc) {
        throw HTTP_STATUSES.NOT_FOUND.createError();
      }
      if (afterInc) {
        await afterInc(scope, doc);
      }
      return undefined;
    },
  };

  if (pre) {
    action.pre = pre;
  }

  restdoneController.actions[`${path}`] = restdoneController.normalizeAction(action, `${path}`);
}

const plugin = {
  restdone: restdoneFn,
};

export default plugin;
