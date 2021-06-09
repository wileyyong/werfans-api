import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import validatorPlugin from 'app/lib/restdone.plugin/validator.restdone.plugin';
import createAppError from 'app/lib/createAppError';
import { Scope } from '../../domains/app';
import { GoalDocument, GoalResource, GoalState } from '../../domains/goal';
import { NotificationType } from '../../domains/notification';
import { BalanceRecordType } from '../../domains/balanceRecord';
import { LiveStreamState } from '../../domains/liveStream';
import { BalanceRecordRefModel } from '../../domains/balanceRecordRefModel';

const {
  consts: {
    RULES: {
      INVALID_STATE,
      NOT_ENOUGH_BALANCE,
      WRONG_SUM,
    },
  },
  modelProvider: {
    Goal,
    LiveStream,
    User,
  },
  paymentService,
  schemas: {
    sendTipBodySchema,
  },
} = app;

/**
 * @swagger
 *
 * /live-streams/{liveStreamId}/goals:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Goals
 *     summary: List all goals
 *     operationId: goalsList
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: liveStream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: liveStream _id
 *     responses:
 *       '200':
 *         description: return an array of goal objects for liveStream
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/GoalModelResponse'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Goals
 *     summary: Creates goal for liveStream
 *     operationId: createGoal
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: liveStream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: liveStream _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/GoalModel'
 *     responses:
 *       '201':
 *         description: returns updated goal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/GoalModelResponseCreated'
 * /live-streams/{liveStreamId}/goals/{goalId}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Goals
 *     summary: Returns goal by _id
 *     operationId: getGoalById
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: liveStream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: liveStream _id
 *       - in: path
 *         name: goalId
 *         description: goal _id
 *         required: true
 *         schema:
 *           type: string
 *           description: goal _id
 *     responses:
 *       '200':
 *         description: returns goals for goal _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/GoalModelResponse'
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Goals
 *     summary: Updates goal by _id
 *     operationId: updateGoalById
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: liveStream _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: liveStream _id
 *       - in: path
 *         name: goalId
 *         description: goal _id
 *         required: true
 *         schema:
 *           type: string
 *           description: goal _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/GoalModel'
 *     responses:
 *       '200':
 *         description: returns updated goal
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/GoalModelResponse'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Goals
 *     summary: Removes goal of current liveStream
 *     operationId: deleteGoalFromLiveStream
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: liveStream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: liveStream _id
 *       - in: path
 *         name: goalId
 *         description: goal _id
 *         required: true
 *         schema:
 *           type: string
 *           description: goal _id
 *     responses:
 *       '204':
 *         description: Empty response
 * /live-streams/{liveStreamId}/goals/{goalId}/{state}:
 *   put:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Goals
 *     summary: Set goal status
 *     operationId: setGoalStatus
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: goalId
 *         description: goal _id
 *         required: true
 *         schema:
 *           type: string
 *           description: goal _id
 *       - in: path
 *         name: state
 *         schema:
 *           type: string
 *           enum:
 *             - cancel
 *             - complete
 *         required: true
 *     responses:
 *       '200':
 *         description: return updated goal object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/GoalModelResponse'
 *
 * /live-streams/{liveStreamId}/goals/{goalId}/tips:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Goals
 *     summary: Send a tip
 *     operationId: sendTipToGoal
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: goalId
 *         description: goal _id
 *         required: true
 *         schema:
 *           type: string
 *           description: goal _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               sum:
 *                 type: number
 *     responses:
 *       '200':
 *         description: return sum
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 sum:
 *                   type: number
 */

class GoalController extends BaseController<
GoalDocument,
Record<string, any>,
GoalResource
> {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: Goal,
        },
      },
      path: ['/live-streams/:liveStream/goals'],
      expandForAdmin: true,
      fields: [
        {
          name: 'owner',
          fields: ['username'],
        },
        'liveStream',
        'title',
        'targetAmount',
        'currentAmount',
        'state',
        'completedAt',
        'createdAt',
        'updatedAt',
      ],
      readOnlyFields: ['currentAmount', 'state', 'completedAt', 'createdAt', 'updatedAt'],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        cancel: {
          method: 'put',
          path: ':_id/cancel',
        },
        complete: {
          method: 'put',
          path: ':_id/complete',
        },
        sendTip: {
          bodySchema: sendTipBodySchema,
          method: 'post',
          path: ':_id/tips',
        },
      },
      plugins: [
        {
          plugin: validatorPlugin.restdone,
        },
      ],
    });
    super(options);
  }

  async pre(scope: Scope<GoalDocument>): Promise<void> {
    const { body, params, params: { liveStream: liveStreamId } } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isSelect() && !scope.isAdminMode) {
      params.owner = currentUser.id;
    }
    if (!scope.isSelect() && (params.owner || body.owner)) {
      const liveStream = await LiveStream
        .findOne({ _id: liveStreamId, owner: params.owner || body.owner })
        .lean();
      if (!liveStream) {
        throw HTTP_STATUSES.FORBIDDEN.createError();
      }
      if (scope.isInsert()) {
        if (liveStream.state === LiveStreamState.Completed) {
          throw createAppError(INVALID_STATE, 'liveStream must be not Completed');
        }
        const otherGoal = await Goal
          .findOne({ liveStream: liveStreamId, state: GoalState.Active })
          .lean();
        if (otherGoal) {
          throw createAppError(INVALID_STATE, 'There should not be other active goal in the liveStream');
        }
      }
    }
  }

  async beforeSave(scope: Scope<GoalDocument>) {
    scope.context.isTargetAmountChanged = scope.model.isModified('targetAmount');
  }

  async afterSave(scope: Scope<GoalDocument>) {
    const { model: goal, context: { isTargetAmountChanged } } = scope;

    if (scope.isInsert() || isTargetAmountChanged) {
      const liveStream = await LiveStream.findOne({ _id: goal.liveStream }).lean();
      const recipients = await User.getSubscribersOf(liveStream.owner);

      const notificationBody = scope.isInsert() ? 'Goal added' : 'Goal changed';

      await app.notificationService.createNotification<{ liveStream: string }>({
        notificationType: NotificationType.LiveStreamGoalChanged,
        body: notificationBody,
        metadata: {
          liveStream: liveStream._id,
          // @ts-ignore
          goal,
        },
        recipients,
      });
    }
  }

  cancel(scope: Scope<GoalDocument>) {
    return this.changeState(scope, GoalState.Cancelled);
  }

  complete(scope: Scope<GoalDocument>) {
    return this.changeState(scope, GoalState.Reached);
  }

  async sendTip(scope: Scope<GoalDocument>) {
    const user = this.getUserStrict(scope);
    const { currentAmount, targetAmount, state } = await this.locateModel(scope);
    if (state !== GoalState.Active) {
      throw createAppError(INVALID_STATE, state);
    }
    const { body: { sum }, params: { _id: goalId } } = scope;
    const adjustedSum = Math.min(targetAmount - currentAmount, sum);
    if (adjustedSum <= 0) {
      throw createAppError(WRONG_SUM);
    }
    const result = await paymentService.processRecord({
      owner: user._id,
      type: BalanceRecordType.SendTip,
      ref: goalId,
      refModel: BalanceRecordRefModel.Goal,
      sum: -1 * adjustedSum,
    });
    if (!result) {
      throw createAppError(NOT_ENOUGH_BALANCE);
    }
    return { sum: adjustedSum };
  }

  async changeState(scope: Scope<GoalDocument>, newState: GoalState) {
    const { params } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isAdminMode) {
      params.owner = currentUser.id;
    }
    const goal = await this.locateModel(scope);
    return goal.updateState(goal.id, newState);
  }
}

exports = GoalController;
module.exports = GoalController;
