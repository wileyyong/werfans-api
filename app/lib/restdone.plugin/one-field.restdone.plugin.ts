/**
 * Created by mk on 02/07/16.
 */

import { ActionOptions, Controller } from 'restdone';
import app from 'app';
import createAppError from 'app/lib/createAppError';
import { Scope } from '../../domains/app';

const {
  consts: {
    RULES: {
      MANDATORY_PARAM_IS_MISSING,
    },
  },
} = app;

export interface RestdoneOptions {
  field: string;
  idFieldName: string,
  path?: string;
  pre: undefined,
}

function restdoneFn(restdoneController: Controller, options: RestdoneOptions) {
  const {
    field,
    path = field,
    idFieldName = '_id',
    pre,
  } = options;

  if (!field) {
    throw new Error('Field is required');
  }

  if (!path) {
    throw new Error('Path is required');
  }

  const action: ActionOptions = {
    method: 'put',
    path: `:${idFieldName}/${path}`,
    async handler(scope: Scope) {
      const newValue = scope.body[field];
      if (!newValue) {
        throw createAppError(MANDATORY_PARAM_IS_MISSING, field);
      }
      const doc = await this.locateModel(scope);
      doc[field] = newValue;
      await doc.save();
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
