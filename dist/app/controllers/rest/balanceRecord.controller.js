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
const me_replacer_restdone_plugin_1 = __importDefault(require("../../lib/restdone.plugin/me-replacer.restdone.plugin"));
const { modelProvider: { BalanceRecord } } = app_1.default;
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
class BalanceRecordController extends base_restdone_controller_1.default {
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
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
                insert: base_restdone_controller_1.default.createAction({
                    enabled: false,
                }),
            },
            plugins: [
                {
                    plugin: me_replacer_restdone_plugin_1.default.restdone,
                    options: {
                        field: 'owner',
                    },
                },
            ],
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { params, params: { owner } } = scope;
            const currentUser = this.getUserStrict(scope);
            if (!scope.isSelect()) {
                throw new Error('Wrong route');
            }
            if (!owner) {
                params.owner = currentUser;
            }
            else if (!currentUser.isAdmin() && owner !== currentUser.id) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
        });
    }
}
module.exports = BalanceRecordController;
//# sourceMappingURL=balanceRecord.controller.js.map