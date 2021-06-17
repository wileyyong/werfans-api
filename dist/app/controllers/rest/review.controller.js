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
const createAppError_1 = __importDefault(require("app/lib/createAppError"));
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const { consts: { RULES: { ALLOW_FOR_ADMIN_ONLY_RULE, }, }, modelProvider: { Review }, } = app_1.default;
/**
 * @swagger
 *
 * /users/{targetUser}/reviews:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reviews
 *     summary: List reviews
 *     operationId: reviewsList
 *     parameters:
 *       - in: path
 *         name: targetUser
 *         description: target user _id, 'me' placeholder is supported
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *     responses:
 *       '200':
 *         description: return an array of review objects for target user
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReviewsModelResponse'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reviews
 *     summary: Creates review
 *     operationId: createReview
 *     parameters:
 *       - in: path
 *         name: targetUser
 *         description: target user _id, 'me' placeholder is supported
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
 *             $ref: '#/components/schemas/ReviewModel'
 *     responses:
 *       '201':
 *         description: returns created review
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ReviewModelResponseCreated'
 * /reviews/{reviewId}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reviews
 *     summary: Returns review by _id
 *     operationId: getReviewById
 *     parameters:
 *       - in: path
 *         name: targetUser
 *         description: target user _id, 'me' placeholder is supported
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: reviewId
 *         description: review _id
 *         required: true
 *         schema:
 *           type: string
 *           description: review _id
 *     responses:
 *       '200':
 *         description: returns reviews by review _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ReviewModelResponse'
 */
class ReviewController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: Review,
                },
            },
            path: ['/users/:targetUser/reviews', '/reviews'],
            expandForAdmin: true,
            fields: [
                {
                    name: 'author',
                    fields: ['username'],
                },
                {
                    name: 'targetUser',
                    fields: ['username'],
                },
                'rating',
                'body',
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
            if (!scope.isAdminMode) {
                const user = this.getUserStrict(scope);
                if (scope.isSelect()) {
                    const { params: { targetUser } } = scope;
                    if (!targetUser) {
                        throw createAppError_1.default(ALLOW_FOR_ADMIN_ONLY_RULE);
                    }
                }
                else {
                    scope.overrideField('author', user._id);
                }
            }
        });
    }
    afterChange(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            const { model } = scope;
            // @ts-ignore
            const targetUser = model.targetUser._id || model.targetUser;
            yield app_1.default.moleculerBroker.call('rating.update', { targetUser: targetUser.toString() });
        });
    }
}
exports.default = ReviewController;
//# sourceMappingURL=review.controller.js.map