import BaseController from '../base.restdone.controller';
import { Scope } from '../../domains/app';

interface RestdoneOptions {
  path: string;
  prepare?: (scope: Scope) => Promise<unknown>;
  name?: string;
  methods: Record<string, any>;
}

function restdoneFn(restdoneController: BaseController, options: RestdoneOptions) {
  const { methods = {}, path, prepare = async () => {}, name = path } = options;

  if (!path) {
    throw new Error('Path is required');
  }

  const action = {
    ...methods,
    method: 'get',
    path,
    priority: -1,
    async handler(this: BaseController, scope: Scope) {
      await prepare.call(this, scope);
      return this.select(scope);
    },
  };

  restdoneController.actions[name] = restdoneController.normalizeAction(action, name);
}

const plugin = {
  restdone: restdoneFn,
};

export default plugin;
