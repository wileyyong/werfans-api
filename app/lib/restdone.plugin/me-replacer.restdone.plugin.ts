import { Controller } from 'restdone';
import { Scope } from '../../domains/app';

export interface RestdoneOptions {
  field?: string;
  replacePattern?: string;
  replacer?: (scope: Scope) => string,
}

function restdone(
  restdoneController: Controller,
  options: RestdoneOptions = {},
) {
  const {
    field = '_id',
    replacePattern = 'me',
    replacer = ({ user }: Scope) => user && user.id,
  } = options;
  const { actions } = restdoneController;
  Object.values(actions).forEach((action) => {
    const { handler: originalHandler = () => {} } = action;
    action.handler = function handler(scope: Scope) {
      const { params } = scope;
      if (params[field] === replacePattern) {
        const newValue = replacer(scope);
        if (!newValue) {
          throw new Error(`Cannot find matching for ${replacePattern}`);
        }
        params[field] = newValue;
      }
      return originalHandler.call(this, scope);
    };
  });
}

const plugin = {
  restdone,
};

export default plugin;
