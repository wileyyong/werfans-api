import _ from 'lodash';
import { Document, DocumentQuery, Model as MongooseModel, Mongoose, Schema, SchemaTypeOpts } from 'mongoose';
import app from 'app';
import createAppError from 'app/lib/createAppError';
import BaseController from '../base.restdone.controller';
import { Scope as AppScope } from '../../domains/app';

const {
  consts: {
    RULES: {
      CANNOT_FIND_MATCHING_RESOURCE,
    },
  },
} = app;

export interface MongooseFieldOptions {
  path: string;
  options?: Partial<SchemaTypeOpts<any>>[];
}

export interface MongooseOptions {
  mongoose: Mongoose;
  fieldName?: string;
  array: MongooseFieldOptions;
  counter?: MongooseFieldOptions;
  noCounter?: boolean;
}

function mongooseFn(schema: Schema, options: MongooseOptions) {
  options = _.merge({
    array: {
      options: [{
        type: Schema.Types.ObjectId,
      }],
    },
    mergeResult: false,
    noCounter: false,
    counter: {
      options: {
        type: Number,
        default: 0,
      },
    },
  }, options || {});

  if (!options.array.path) {
    throw new Error('options.array.path is not provided');
  }

  if (!options.noCounter && !options.counter!.path) {
    options.counter!.path = `${options.array.path}Counter`;
  }

  schema.path(options.array.path, options.array.options);

  if (!options.noCounter) {
    schema.path(options.counter!.path, options.counter!.options);
  }
}

interface Scope extends AppScope {
  added: boolean;
  itemIds: string[];
  removed: boolean;
}

export interface RestdoneOptions {
  afterDelete: (result: Record<string, any>, scope: Scope) => Record<string, any>;
  afterGet: (result: Record<string, any>, scope: Scope) => Record<string, any>;
  afterPut: (result: Record<string, any>, scope: Scope) => Record<string, any>;
  beforeSaveDelete: (document: Document, scope: Scope) => Document,
  beforeSavePut: (document: Document, scope: Scope) => Document,
  Model: MongooseModel<any>;
  path: string;
  array: string;
  mergeResult: boolean;
  noCounter: boolean;
  multi: boolean;
  readOnly: boolean;
  writeOnly: boolean;
  allowDelete: boolean;
  supportPost: boolean;
  supportPut: boolean;
  fieldsToFetch: string[];
  pre: (scope: Scope) => Promise<void>;
  extractItemIds: (scope: Scope) => string[];
}

function restdoneFn(
  restdoneController: BaseController<any, any, any>,
  options: Partial<RestdoneOptions>,
) {
  const strictOptions = <RestdoneOptions>_.merge({
    mergeResult: false,
    noCounter: false,
    multi: true,
    readOnly: false,
    allowDelete: true,
    supportPost: false,
    supportPut: true,
    fieldsToFetch: [],
    pre: restdoneController.pre,
    extractItemIds: (scope: Scope) => (scope.params.itemId ? [scope.params.itemId] : scope.body),
  }, options || {});

  const arrayFieldName = strictOptions.array;
  const counterFieldName = `${arrayFieldName}Counter`;
  const {
    afterDelete,
    afterGet,
    afterPut,
    allowDelete,
    beforeSaveDelete,
    beforeSavePut,
    extractItemIds,
    fieldsToFetch,
    Model,
    multi,
    path,
    readOnly,
    supportPost,
    supportPut,
    writeOnly,
  } = strictOptions;
  if (fieldsToFetch.indexOf(arrayFieldName) < 0) {
    fieldsToFetch.push(arrayFieldName);
  }

  const getFetchingFields = function getFetchingFields(this: BaseController) {
    return _.pick(this.fieldMap, fieldsToFetch);
  };

  function buildConditions(scope: Scope) {
    // @ts-ignore
    const result = scope.owner.buildConditions(scope);

    // it's aliens
    delete scope.source.itemId;

    return result;
  }

  async function putToArray(this: BaseController, scope: Scope) {
    if (_.isFunction(this.pre)) {
      await this.pre(scope);
    }
    const doc = await Model.findOne({ _id: scope.params._id }, fieldsToFetch.join(' '));
    if (!doc) {
      throw createAppError(CANNOT_FIND_MATCHING_RESOURCE);
    }

    scope.itemIds = extractItemIds(scope);
    scope.added = doc[arrayFieldName].addToSet(...scope.itemIds);

    if (!options.noCounter) {
      doc[counterFieldName] = doc[arrayFieldName].length;
    }

    if (_.isFunction(beforeSavePut) && scope.added) {
      await beforeSavePut(doc, scope);
    }
    await doc.save();

    const newDoc = await this.locateModel(scope);
    const resultDocument = this.dataSource.toObject(newDoc);
    const postResult = await this.post(newDoc, scope);
    scope.newContent = true;
    const result = resultDocument[arrayFieldName];
    if (options.mergeResult) {
      const finalResult = <any[]>[];
      _.forEach(result, (item) => {
        if (postResult[item._id]) {
          finalResult.push(_.merge(item, postResult[item._id]));
        } else {
          finalResult.push(item);
        }
      });

      return finalResult;
    } else {
      return result;
    }
  }

  async function postPut(result: Record<string, any>, scope: Scope) {
    if (_.isFunction(afterPut) && scope.added) {
      return afterPut(result, scope);
    } else {
      return null;
    }
  }

  async function deleteFromArray(this: BaseController, scope: Scope) {
    if (_.isFunction(this.pre)) {
      await this.pre(scope);
    }
    const doc = await Model.findOne({ _id: scope.params._id }, fieldsToFetch.join(' '));
    if (!doc) {
      throw createAppError(CANNOT_FIND_MATCHING_RESOURCE);
    }

    scope.itemIds = extractItemIds(scope);

    const lengthBefore = doc[arrayFieldName].length;
    doc[arrayFieldName].pull(...scope.itemIds);

    if (!options.noCounter) {
      doc[counterFieldName] = doc[arrayFieldName].length;
    }

    scope.removed = lengthBefore > doc[arrayFieldName].length;

    if (_.isFunction(beforeSaveDelete) && scope.removed) {
      await beforeSaveDelete(doc, scope);
    }
    await doc.save();

    await this.post(doc, scope);

    return undefined;
  }

  async function postDelete(result: Record<string, any>, scope: Scope) {
    if (_.isFunction(afterDelete) && scope.removed) {
      await afterDelete(result, scope);
    }
    return result;
  }

  if (!readOnly) {
    if (supportPut) {
      restdoneController.actions[`${arrayFieldName}Put`] = restdoneController.normalizeAction({
        method: 'put',
        path: `:_id/${path}/:itemId`,
        getFetchingFields,
        buildConditions,
        pre: options.pre,
        post: postPut,
        handler: putToArray,
      }, `${arrayFieldName}Put`);

      if (multi) {
        restdoneController.actions[`${arrayFieldName}PutMulti`] = restdoneController.normalizeAction({
          method: 'put',
          path: `:_id/${path}`,
          getFetchingFields,
          buildConditions,
          pre: options.pre,
          post: postPut,
          handler: putToArray,
        }, `${arrayFieldName}PutMulti`);
      }
    }

    if (supportPost) {
      if (multi) {
        restdoneController.actions[`${arrayFieldName}PostMulti`] = restdoneController.normalizeAction({
          method: 'post',
          path: `:_id/${path}`,
          getFetchingFields,
          buildConditions,
          pre: options.pre,
          post: postPut,
          handler: putToArray,
        }, `${arrayFieldName}PostMulti`);
      }
    }
  }

  if (!writeOnly) {
    restdoneController.actions[`${arrayFieldName}Get`] = restdoneController.normalizeAction({
      method: 'get',
      path: `:_id/${path}`,
      priority: -1,
      getFetchingFields,
      buildConditions,
      queryPipe: function queryPipe(query: DocumentQuery<any, Document>, scope: Scope) {
        const pagination = this.getPagination(scope);
        const limit = parseInt(pagination.limit, 10);
        const { page } = pagination;
        const skip = (page - 1) * limit;

        // @ts-ignore
        query.slice(arrayFieldName, skip, limit);
      },
      pre: options.pre,
      post: async function post(result: Record<string, any>, scope: Scope) {
        if (_.isFunction(afterGet)) {
          await afterGet(result, scope);
        }
        return result;
      },
      async handler(scope: Scope) {
        const doc = await this.locateModel(scope);
        const postResult = await this.post(this.dataSource.toObject(doc), scope);
        return postResult[arrayFieldName];
      },
    }, `${arrayFieldName}Get`);
  }

  if (!readOnly && allowDelete) {
    restdoneController.actions[`${arrayFieldName}Delete`] = restdoneController.normalizeAction({
      method: 'delete',
      path: `:_id/${path}/:itemId`,
      pre: options.pre,
      post: postDelete,
      handler: deleteFromArray,
    }, `${arrayFieldName}Delete`);

    if (multi) {
      restdoneController.actions[`${arrayFieldName}DeleteMulti`] = restdoneController.normalizeAction({
        method: 'delete',
        path: `:_id/${path}`,
        pre: options.pre,
        post: postDelete,
        handler: deleteFromArray,
      }, `${arrayFieldName}DeleteMulti`);
    }
  }
}

const plugin = {
  mongoose: mongooseFn,
  restdone: restdoneFn,
};

export default plugin;
