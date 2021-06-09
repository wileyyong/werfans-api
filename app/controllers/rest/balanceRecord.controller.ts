import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import { Scope } from '../../domains/app';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';
import { BalanceRecordDocument, BalanceRecordResource } from '../../domains/balanceRecord';

const { modelProvider: { BalanceRecord } } = app;

/**
 * @swagger
 *
 * /balance-records/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - BalanceRecords
 *     summary: Returns balanceRecord by id
 *     operationId: getBalanceRecord
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns notification by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/BalanceRecordResponse'
 * /users/{userId}/balance-records:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - BalanceRecords
 *     summary: Returns array of balanceRecords of the specified user
 *     operationId: getBalanceRecords
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: userId, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: userId, 'me' accepted too
 *     responses:
 *       '200':
 *         description: returns users's balanceRecords
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/BalanceRecordResponse'
 */

class BalanceRecordController extends BaseController<
BalanceRecordDocument,
Record<string, any>,
BalanceRecordResource
> {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: BalanceRecord,
        },
      },
      path: '/users/:owner/balance-records',
      fields: [
        'owner',
        'type',
        'sum',
        'ref',
        'refModel',
        'createdAt',
        'processedAt',
      ],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        insert: BaseController.createAction({
          enabled: false,
        }),
      },
      plugins: [
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'owner',
          },
        },
      ],
    });

    super(options);
  }

  async pre(scope: Scope<BalanceRecordDocument>): Promise<void> {
    const { params, params: { owner } } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isSelect()) {
      throw new Error('Wrong route');
    }

    if (!owner) {
      params.owner = currentUser;
    } else if (!currentUser.isAdmin() && owner !== currentUser.id) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }
  }
}

module.exports = BalanceRecordController;
