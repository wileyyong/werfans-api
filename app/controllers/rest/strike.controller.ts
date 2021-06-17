import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import { Scope } from '../../domains/app';
import { StrikeDocument, StrikeResource, StrikeState } from '../../domains/strike';
import meReplacerPlugin from '../../lib/restdone.plugin/me-replacer.restdone.plugin';
import { StrikeCreated, StrikeRevoked } from '../../domains/molecules';
import createAppError from '../../lib/createAppError';

const {
  consts: {
    events,
    RULES: {
      INVALID_STATE_TRANSITION,
    },
  },
  modelProvider: {
    Strike,
  },
} = app;

/**
 * @swagger
 *
 * /strikes:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Strikes
 *     summary: List all strikes
 *     operationId: strikesList
 *     responses:
 *       '200':
 *         description: return an array of strike objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/StrikeModelResponseList'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Strikes
 *     summary: Create strike
 *     operationId: createStrike
 *     requestBody:
 *       description: object containing the properties to create strike
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/StrikeModel'
 *     responses:
 *       '201':
 *         description: return created strike object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/StrikeModelResponseCreated'
 * /strikes/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Strikes
 *     summary: Returns strike by _id
 *     operationId: getStrikes
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns strike by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/StrikeModelResponseList'
 * /strikes/{_id}/{state}:
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Strikes
 *     summary: Set strike status
 *     operationId: setStrikeStatus
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *       - in: path
 *         name: state
 *         schema:
 *           type: string
 *           enum:
 *             - revoke
 *             - confirm
 *         required: true
 *     responses:
 *       '200':
 *         description: return updated strike object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/StrikeModelResponseList'
 * /users/{userId}/strikes/{strikeId}:
 *   get:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Strikes
 *     summary: Returns strike by _id.
 *     operationId: getStrikeById
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: strikeId
 *         description: strike _id
 *         required: true
 *         schema:
 *           type: string
 *           description: strike _id
 *     responses:
 *       '200':
 *         description: returns strikes for user _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/StrikeModelResponseList'
 *   patch:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Strikes
 *     summary: Updates strike by _id.
 *     operationId: updateStrikeById
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: strikeId
 *         description: strike _id
 *         required: true
 *         schema:
 *           type: string
 *           description: strike _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/StrikeModel'
 *     responses:
 *       '200':
 *         description: returns updated strike
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/StrikeModelResponseList'
 *   delete:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Strikes
 *     summary: Removes strike of current user
 *     operationId: deleteStrikeFromUser
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: strikeId
 *         description: strike _id
 *         required: true
 *         schema:
 *           type: string
 *           description: strike _id
 *     responses:
 *       '204':
 *         description: Empty response
 */

class StrikeController extends BaseController<
StrikeDocument,
Record<string, any>,
StrikeResource
> {
  constructor(options = {}) {
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: Strike,
        },
      },
      path: ['/strikes', '/users/:targetUser/strikes'],
      expandForAdmin: true,
      fields: [
        {
          name: 'creator',
          fields: ['username'],
        },
        {
          name: 'targetUser',
          fields: ['username'],
        },
        'type',
        'description',
        'state',
        'ref',
        'refModel',
        'createdAt',
        'updatedAt',
      ],
      readOnlyFields: ['createdAt', 'updatedAt'],
      actions: {
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        revoke: {
          method: 'post',
          path: ':_id/revoke',
        },
        confirm: {
          method: 'post',
          path: ':_id/confirm',
        },
      },
      plugins: [
        {
          plugin: meReplacerPlugin.restdone,
          options: {
            field: 'creator',
          },
        },
      ],
    });
    super(options);
  }

  async pre(scope: Scope<StrikeDocument>): Promise<void> {
    const { params } = scope;
    const currentUser = this.getUserStrict(scope);
    if (!scope.isSelect()) {
      params.creator = currentUser.id;
    }
    if (!scope.isAdminMode) {
      if (!scope.isSelect()) {
        throw HTTP_STATUSES.FORBIDDEN.createError();
      } else {
        params.targetUser = currentUser.id;
      }
    }
  }

  async revoke(scope: Scope<StrikeDocument>) {
    await this.pre(scope);
    this.requireAdmin(scope);

    const strike = <StrikeDocument>(await this.locateModel(scope));
    this.changeStrikeState(strike, StrikeState.Revoked);
    await strike.save();

    app.moleculerBroker.emit(events.strikes.revoked, <StrikeRevoked>{
      _id: strike._id,
      targetUser: strike.targetUser,
      ref: strike.ref,
      refModel: strike.refModel,
    });

    return strike;
  }

  async confirm(scope: Scope<StrikeDocument>) {
    await this.pre(scope);
    this.requireAdmin(scope);

    const strike = <StrikeDocument>(await this.locateModel(scope));
    this.changeStrikeState(strike, StrikeState.Confirmed);
    await strike.save();

    return strike;
  }

  assignFilter(
    queryParams: Record<string, any>,
    fieldName: string,
    scope: Scope<StrikeDocument>,
  ) {
    const { user } = scope;
    // do not allow not-admins update creator and targetUser
    if ((fieldName === 'creator' || fieldName === 'targetUser')
      && scope.isUpdate()
      && !user?.isAdmin()
    ) {
      return false;
    }
    return super.assignFilter(queryParams, fieldName, scope);
  }

  async afterSave(scope: Scope<StrikeDocument>) {
    if (scope.isInsert()) {
      app.moleculerBroker.emit(events.strikes.created, <StrikeCreated>{
        _id: scope.model.id,
        targetUser: scope.model.targetUser,
      });
    }
  }

  private changeStrikeState(strike: StrikeDocument, newState: StrikeState) {
    if (!strike.changeState(newState)) {
      throw createAppError(INVALID_STATE_TRANSITION, { currentState: strike.state, newState });
    }
  }
}

exports = StrikeController;
module.exports = StrikeController;
