import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import { RewardDocument, RewardResource } from '../../domains/reward';
import { Scope } from '../../domains/app';

const { modelProvider: { Reward } } = app;

/**
 * @swagger
 *
 * /rewards/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Rewards
 *     summary: Returns reward by id
 *     operationId: getRewards
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns reward by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/RewardModelResponse'
 * /rewards:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Rewards
 *     summary: Returns array of rewards
 *     operationId: getRewards
 *     responses:
 *       '200':
 *         description: returns rewards
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/RewardModelResponse'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Rewards
 *     summary: Creates a reward
 *     operationId: createReward
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/RewardModel'
 *     responses:
 *       '201':
 *         description: returns created Reward
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/RewardModelResponse'
 * /rewards/{rewardId}:
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Rewards
 *     summary: Updates reward by _id
 *     operationId: updateReward
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         description: Reward _id
 *         required: true
 *         schema:
 *           type: string
 *           description: Reward _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/RewardModel'
 *     responses:
 *       '200':
 *         description: returns updated Reward
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/RewardModelResponse'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Rewards
 *     summary: Removes reward by _id
 *     operationId: deleteReward
 *     parameters:
 *       - in: path
 *         name: rewardId
 *         description: Reward _id
 *         required: true
 *         schema:
 *           type: string
 *           description: Reward _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/RewardModelResponse'
 *     responses:
 *       '204':
 *         description: Empty response
 */

class RewardController extends BaseController<
RewardDocument,
Record<string, any>,
RewardResource
> {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: Reward,
        },
      },
      path: ['/rewards'],
      fields: [
        'reward',
        'description',
        'period',
        'place',
        'createdAt',
        'updatedAt',
      ],
      readOnlyFields: ['createdAt', 'updatedAt'],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
      },
    });
    super(options);
  }

  async pre(scope: Scope<RewardDocument>): Promise<void> {
    const { user: currentUser } = scope;
    if (!currentUser) {
      throw new Error('No user');
    }
    if (scope.isChanging() && !currentUser.isAdmin()) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
    }
  }
}

exports = RewardController;
module.exports = RewardController;
