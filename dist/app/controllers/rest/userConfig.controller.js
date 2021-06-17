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
const http_status_node_1 = __importDefault(require("http-status-node"));
const app_1 = __importDefault(require("app"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const idEqual_1 = __importDefault(require("../../lib/helpers/idEqual"));
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const { modelProvider: { UserConfig } } = app_1.default;
/**
 * @swagger
 *
 * /users/{userId}/configs:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - UserConfigs
 *     summary: List all user configs
 *     operationId: userConfigsList
 *     responses:
 *       '200':
 *         description: return an array of usre config objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/UserConfigModelResponse'
 *   put:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - UserConfigs
 *     summary: Create user config
 *     operationId: createUserConfig
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *     requestBody:
 *       description: object containing the properties to create user config
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/UserConfigModel'
 *     responses:
 *       '201':
 *         description: return created user config object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/UserConfigModelResponse'
 * /users/{userId}/configs/{key}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - UserConfigs
 *     summary: Returns user config by key
 *     operationId: getUserConfigs
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns user config by key
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/UserConfigModelResponse'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - UserConfigs
 *     summary: Removes user config of current user
 *     operationId: deleteUserConfig
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: key
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '204':
 *         description: Empty response
 */
class UserConfigController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        options = options || {};
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: UserConfig,
                },
            },
            path: ['/users/:user/configs'],
            fields: [
                'user',
                'key',
                'data',
                'createdAt',
                'updatedAt',
            ],
            readOnlyFields: [
                'createdAt',
                'updatedAt',
            ],
            idField: 'key',
            smartPut: true,
            actions: {
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
            },
            plugins: [
                {
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                    options: {
                        field: 'user',
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.getUserStrict(scope);
            if (!user.isAdmin() && !idEqual_1.default(user._id, scope.params.user)) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
        });
    }
}
exports.default = UserConfigController;
//# sourceMappingURL=userConfig.controller.js.map