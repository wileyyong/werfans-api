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
const { modelProvider: { Reward } } = app_1.default;
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
class RewardController extends base_restdone_controller_1.default {
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
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
            },
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { user: currentUser } = scope;
            if (!currentUser) {
                throw new Error('No user');
            }
            if (scope.isChanging() && !currentUser.isAdmin()) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
        });
    }
}
exports = RewardController;
module.exports = RewardController;
//# sourceMappingURL=reward.controller.js.map