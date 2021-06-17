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
const strike_1 = require("../../domains/strike");
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const createAppError_1 = __importDefault(require("../../lib/createAppError"));
const { consts: { events, RULES: { INVALID_STATE_TRANSITION, }, }, modelProvider: { Strike, }, } = app_1.default;
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
class StrikeController extends base_restdone_controller_1.default {
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
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
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
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                    options: {
                        field: 'creator',
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isSelect()) {
                params.creator = currentUser.id;
            }
            if (!scope.isAdminMode) {
                if (!scope.isSelect()) {
                    throw http_status_node_1.default.FORBIDDEN.createError();
                }
                else {
                    params.targetUser = currentUser.id;
                }
            }
        });
    }
    revoke(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pre(scope);
            this.requireAdmin(scope);
            const strike = (yield this.locateModel(scope));
            this.changeStrikeState(strike, strike_1.StrikeState.Revoked);
            yield strike.save();
            app_1.default.moleculerBroker.emit(events.strikes.revoked, {
                _id: strike._id,
                targetUser: strike.targetUser,
                ref: strike.ref,
                refModel: strike.refModel,
            });
            return strike;
        });
    }
    confirm(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.pre(scope);
            this.requireAdmin(scope);
            const strike = (yield this.locateModel(scope));
            this.changeStrikeState(strike, strike_1.StrikeState.Confirmed);
            yield strike.save();
            return strike;
        });
    }
    assignFilter(queryParams, fieldName, scope) {
        const { user } = scope;
        // do not allow not-admins update creator and targetUser
        if ((fieldName === 'creator' || fieldName === 'targetUser')
            && scope.isUpdate()
            && !(user === null || user === void 0 ? void 0 : user.isAdmin())) {
            return false;
        }
        return super.assignFilter(queryParams, fieldName, scope);
    }
    afterSave(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            if (scope.isInsert()) {
                app_1.default.moleculerBroker.emit(events.strikes.created, {
                    _id: scope.model.id,
                    targetUser: scope.model.targetUser,
                });
            }
        });
    }
    changeStrikeState(strike, newState) {
        if (!strike.changeState(newState)) {
            throw createAppError_1.default(INVALID_STATE_TRANSITION, { currentState: strike.state, newState });
        }
    }
}
exports = StrikeController;
module.exports = StrikeController;
//# sourceMappingURL=strike.controller.js.map