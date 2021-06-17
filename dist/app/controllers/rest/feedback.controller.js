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
const { modelProvider: { Feedback } } = app_1.default;
/**
 * @swagger
 *
 * /users/{userId}/feedbacks:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Feedbacks
 *     summary: List all feedbacks
 *     operationId: feedbacksList
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *     responses:
 *       '200':
 *         description: return an array of feedback objects for user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/FeedbackModelResponse'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Feedbacks
 *     summary: Creates feedback
 *     operationId: createFeedback
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/FeedbackModel'
 *     responses:
 *       '201':
 *         description: returns updated feedback
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/FeedbackModelResponseCreated'
 * /users/{userId}/feedbacks/{feedbackId}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Feedbacks
 *     summary: Returns feedback by _id
 *     operationId: getFeedbackById
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id, 'me' accepted too
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: feedbackId
 *         description: feedback _id
 *         required: true
 *         schema:
 *           type: string
 *           description: feedback _id
 *     responses:
 *       '200':
 *         description: returns feedbacks for feedback _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/FeedbackModelResponse'
 */
class FeedbackController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: Feedback,
                },
            },
            path: ['/users/:author/feedbacks'],
            fields: [
                {
                    name: 'author',
                    fields: ['username'],
                },
                'body',
                'photoUrl',
                'type',
                'createdAt',
                'updatedAt',
            ],
            readOnlyFields: ['createdAt', 'updatedAt'],
            actions: {
                default: base_restdone_controller_1.default.createAction({
                    auth: [base_restdone_controller_1.default.AUTH.BEARER],
                }),
                update: base_restdone_controller_1.default.createAction({
                    enabled: false,
                }),
            },
        });
        super(options);
    }
    pre(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { body, params } = scope;
            const user = this.getUserStrict(scope);
            if (scope.isSelect() && !user.isAdmin() && !scope.isResourceOwner(user.id, params.author)) {
                throw http_status_node_1.default.FORBIDDEN.createError('You do not have permission to access this feedback.');
            }
            if (!scope.isSelect() || !user.isAdmin()) {
                params.author = user.id;
                body.author = user.id;
            }
        });
    }
}
exports.default = FeedbackController;
//# sourceMappingURL=feedback.controller.js.map