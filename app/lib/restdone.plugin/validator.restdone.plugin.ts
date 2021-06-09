import { Controller } from 'restdone';
import { Scope } from '../../domains/app';
import BaseRestdoneController from '../base.restdone.controller';
import validateSchema from '../validateSchema';

function restdone(
  restdoneController: Controller,
) {
  const { actions } = restdoneController;
  Object.values(actions).forEach((action) => {
    const { handler: originalHandler = () => {}, bodySchema, validate } = action;
    action.handler = async function handler(
      this: BaseRestdoneController<any, any, any>,
      scope: Scope,
    ) {
      if (bodySchema) {
        await validateSchema(scope.body, bodySchema);
      }
      if (validate) {
        await validate.call(this, scope);
      }
      return originalHandler.call(this, scope);
    };
  });
}

const plugin = {
  restdone,
};

export default plugin;
