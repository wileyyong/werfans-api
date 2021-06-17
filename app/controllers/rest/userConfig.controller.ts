import HTTP_STATUSES from 'http-status-node';
import app from 'app';
import BaseController from 'app/lib/base.restdone.controller';
import { Scope } from '../../domains/app';
import { UserConfigDocument, UserConfigResource } from '../../domains/userConfig';
import idEqual from '../../lib/helpers/idEqual';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';

const { modelProvider: { UserConfig } } = app;

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

class UserConfigController extends BaseController<
UserConfigDocument,
Record<string, any>,
UserConfigResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
      },
      plugins: [
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'user',
          },
        },
      ],
    });

    super(options);
  }

  async pre(scope: Scope<UserConfigDocument>): Promise<void> {
    const user = this.getUserStrict(scope);
    if (!user.isAdmin() && !idEqual(user._id, scope.params.user)) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }
  }
}

export default UserConfigController;
