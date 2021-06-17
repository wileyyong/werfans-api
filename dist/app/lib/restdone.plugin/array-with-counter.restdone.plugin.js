"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const lodash_1 = __importDefault(require("lodash"));
const mongoose_1 = require("mongoose");
const app_1 = __importDefault(require("app"));
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const { consts: { RULES: { CANNOT_FIND_MATCHING_RESOURCE, }, }, } = app_1.default;
function mongooseFn(schema, options) {
    options = lodash_1.default.merge({
        array: {
            options: [{
                    type: mongoose_1.Schema.Types.ObjectId,
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
    if (!options.noCounter && !options.counter.path) {
        options.counter.path = `${options.array.path}Counter`;
    }
    schema.path(options.array.path, options.array.options);
    if (!options.noCounter) {
        schema.path(options.counter.path, options.counter.options);
    }
}
function restdoneFn(restdoneController, options) {
    const strictOptions = lodash_1.default.merge({
        mergeResult: false,
        noCounter: false,
        multi: true,
        readOnly: false,
        allowDelete: true,
        supportPost: false,
        supportPut: true,
        fieldsToFetch: [],
        pre: restdoneController.pre,
        extractItemIds: (scope) => (scope.params.itemId ? [scope.params.itemId] : scope.body),
    }, options || {});
    const arrayFieldName = strictOptions.array;
    const counterFieldName = `${arrayFieldName}Counter`;
    const { afterDelete, afterGet, afterPut, allowDelete, beforeSaveDelete, beforeSavePut, extractItemIds, fieldsToFetch, Model, multi, path, readOnly, supportPost, supportPut, writeOnly, } = strictOptions;
    if (fieldsToFetch.indexOf(arrayFieldName) < 0) {
        fieldsToFetch.push(arrayFieldName);
    }
    const getFetchingFields = function getFetchingFields() {
        return lodash_1.default.pick(this.fieldMap, fieldsToFetch);
    };
    function buildConditions(scope) {
        // @ts-ignore
        const result = scope.owner.buildConditions(scope);
        // it's aliens
        delete scope.source.itemId;
        return result;
    }
    function putToArray(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lodash_1.default.isFunction(this.pre)) {
                yield this.pre(scope);
            }
            const doc = yield Model.findOne({ _id: scope.params._id }, fieldsToFetch.join(' '));
            if (!doc) {
                throw createAppError_1.default(CANNOT_FIND_MATCHING_RESOURCE);
            }
            scope.itemIds = extractItemIds(scope);
            scope.added = doc[arrayFieldName].addToSet(...scope.itemIds);
            if (!options.noCounter) {
                doc[counterFieldName] = doc[arrayFieldName].length;
            }
            if (lodash_1.default.isFunction(beforeSavePut) && scope.added) {
                yield beforeSavePut(doc, scope);
            }
            yield doc.save();
            const newDoc = yield this.locateModel(scope);
            const resultDocument = this.dataSource.toObject(newDoc);
            const postResult = yield this.post(newDoc, scope);
            scope.newContent = true;
            const result = resultDocument[arrayFieldName];
            if (options.mergeResult) {
                const finalResult = [];
                lodash_1.default.forEach(result, (item) => {
                    if (postResult[item._id]) {
                        finalResult.push(lodash_1.default.merge(item, postResult[item._id]));
                    }
                    else {
                        finalResult.push(item);
                    }
                });
                return finalResult;
            }
            else {
                return result;
            }
        });
    }
    function postPut(result, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lodash_1.default.isFunction(afterPut) && scope.added) {
                return afterPut(result, scope);
            }
            else {
                return null;
            }
        });
    }
    function deleteFromArray(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lodash_1.default.isFunction(this.pre)) {
                yield this.pre(scope);
            }
            const doc = yield Model.findOne({ _id: scope.params._id }, fieldsToFetch.join(' '));
            if (!doc) {
                throw createAppError_1.default(CANNOT_FIND_MATCHING_RESOURCE);
            }
            scope.itemIds = extractItemIds(scope);
            const lengthBefore = doc[arrayFieldName].length;
            doc[arrayFieldName].pull(...scope.itemIds);
            if (!options.noCounter) {
                doc[counterFieldName] = doc[arrayFieldName].length;
            }
            scope.removed = lengthBefore > doc[arrayFieldName].length;
            if (lodash_1.default.isFunction(beforeSaveDelete) && scope.removed) {
                yield beforeSaveDelete(doc, scope);
            }
            yield doc.save();
            yield this.post(doc, scope);
            return undefined;
        });
    }
    function postDelete(result, scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (lodash_1.default.isFunction(afterDelete) && scope.removed) {
                yield afterDelete(result, scope);
            }
            return result;
        });
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
            queryPipe: function queryPipe(query, scope) {
                const pagination = this.getPagination(scope);
                const limit = parseInt(pagination.limit, 10);
                const { page } = pagination;
                const skip = (page - 1) * limit;
                // @ts-ignore
                query.slice(arrayFieldName, skip, limit);
            },
            pre: options.pre,
            post: function post(result, scope) {
                return __awaiter(this, void 0, void 0, function* () {
                    if (lodash_1.default.isFunction(afterGet)) {
                        yield afterGet(result, scope);
                    }
                    return result;
                });
            },
            handler(scope) {
                return __awaiter(this, void 0, void 0, function* () {
                    const doc = yield this.locateModel(scope);
                    const postResult = yield this.post(this.dataSource.toObject(doc), scope);
                    return postResult[arrayFieldName];
                });
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
exports.default = plugin;
//# sourceMappingURL=array-with-counter.restdone.plugin.js.map