'use strict';

/**
 * Created by mk on 02/07/16.
 */

const _ = require('lodash');

function restdone(restdoneController, options) {
  options = _.merge({
    Model: undefined,
    fieldName: 'unread',
    path: undefined,
  }, options || {});

  const {
    fieldName,
    Model,
    afterRemove,
    afterRemoveAll,
  } = options;
  if (!Model) {
    throw new Error('Model is not provided');
  }
  const path = options.path || fieldName;

  restdoneController.actions[`${fieldName}Remove`] = restdoneController.normalizeAction({
    method: 'delete',
    path: `:_id/${path}`,
    priority: -1,
    async handler(scope) {
      const { params: { _id }, user: { _id: userId } } = scope;
      await Model.updateOne({ _id }, { $pull: { [fieldName]: userId } });
      if (_.isFunction(afterRemove)) {
        await afterRemove(scope);
      }
      return undefined;
    },
  }, `${fieldName}Remove`);

  restdoneController.actions[`${fieldName}RemoveAll`] = restdoneController.normalizeAction({
    method: 'delete',
    path: `${path}`,
    priority: -1,
    async handler(scope) {
      const { params, user: { _id: userId } } = scope;
      await Model.updateMany(params, { $pull: { [fieldName]: userId } }, { multi: true });
      if (_.isFunction(afterRemoveAll)) {
        await afterRemoveAll(scope);
      }
      return undefined;
    },
  }, `${fieldName}RemoveAll`);
}

module.exports.restdone = restdone;
