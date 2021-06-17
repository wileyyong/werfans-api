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
const app_1 = __importDefault(require("app"));
const http_status_node_1 = __importDefault(require("http-status-node"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const validator_restdone_plugin_1 = __importDefault(require("app/lib/restdone.plugin/validator.restdone.plugin"));
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const goal_1 = require("../../domains/goal");
const notification_1 = require("../../domains/notification");
const balanceRecord_1 = require("../../domains/balanceRecord");
const liveStream_1 = require("../../domains/liveStream");
const balanceRecordRefModel_1 = require("../../domains/balanceRecordRefModel");
const { consts: { RULES: { INVALID_STATE, NOT_ENOUGH_BALANCE, WRONG_SUM, }, }, modelProvider: { Goal, LiveStream, User, }, paymentService, schemas: { sendTipBodySchema, }, } = app_1.default;
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
class GoalController extends base_restdone_controller_1.default {
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
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
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
                    plugin: validator_restdone_plugin_1.default.restdone,
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body, params, params: { liveStream: liveStreamId } } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isSelect() && !scope.isAdminMode) {
                params.owner = currentUser.id;
            }
            if (!scope.isSelect() && (params.owner || body.owner)) {
                const liveStream = yield LiveStream
                    .findOne({ _id: liveStreamId, owner: params.owner || body.owner })
                    .lean();
                if (!liveStream) {
                    throw http_status_node_1.default.FORBIDDEN.createError();
                }
                if (scope.isInsert()) {
                    if (liveStream.state === liveStream_1.LiveStreamState.Completed) {
                        throw createAppError_1.default(INVALID_STATE, 'liveStream must be not Completed');
                    }
                    const otherGoal = yield Goal
                        .findOne({ liveStream: liveStreamId, state: goal_1.GoalState.Active })
                        .lean();
                    if (otherGoal) {
                        throw createAppError_1.default(INVALID_STATE, 'There should not be other active goal in the liveStream');
                    }
                }
            }
        });
    }
    beforeSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            scope.context.isTargetAmountChanged = scope.model.isModified('targetAmount');
        });
    }
    afterSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { model: goal, context: { isTargetAmountChanged } } = scope;
            if (scope.isInsert() || isTargetAmountChanged) {
                const liveStream = yield LiveStream.findOne({ _id: goal.liveStream }).lean();
                if (liveStream) {
                    const recipients = yield User.getSubscribersOf(liveStream.owner);
                    const notificationBody = scope.isInsert() ? 'Goal added' : 'Goal changed';
                    yield app_1.default.notificationService.createNotification({
                        notificationType: notification_1.NotificationType.LiveStreamGoalChanged,
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
        });
    }
    cancel(scope) {
        return this.changeState(scope, goal_1.GoalState.Cancelled);
    }
    complete(scope) {
        return this.changeState(scope, goal_1.GoalState.Reached);
    }
    sendTip(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = this.getUserStrict(scope);
            const { currentAmount, targetAmount, state } = yield this.locateModel(scope);
            if (state !== goal_1.GoalState.Active) {
                throw createAppError_1.default(INVALID_STATE, state);
            }
            const { body: { sum }, params: { _id: goalId } } = scope;
            const adjustedSum = Math.min(targetAmount - currentAmount, sum);
            if (adjustedSum <= 0) {
                throw createAppError_1.default(WRONG_SUM);
            }
            const result = yield paymentService.processRecord({
                owner: user._id,
                type: balanceRecord_1.BalanceRecordType.SendTip,
                ref: goalId,
                refModel: balanceRecordRefModel_1.BalanceRecordRefModel.Goal,
                sum: -1 * adjustedSum,
            });
            if (!result) {
                throw createAppError_1.default(NOT_ENOUGH_BALANCE);
            }
            return { sum: adjustedSum };
        });
    }
    changeState(scope, newState) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isAdminMode) {
                params.owner = currentUser.id;
            }
            const goal = yield this.locateModel(scope);
            return goal.updateState(goal.id, newState);
        });
    }
}
exports = GoalController;
module.exports = GoalController;
//# sourceMappingURL=goal.controller.js.map