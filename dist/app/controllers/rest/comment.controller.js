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
const comment_1 = require("../../domains/comment");
const { modelProvider: { Comment } } = app_1.default;
/**
 * @swagger
 *
 * /live-streams/{liveStreamId}/comments:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Comments
 *     summary: Returns comments by livestream _id
 *     operationId: getCommentByLivestreamId
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: livestream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: livestream _id
 *     responses:
 *       '200':
 *         description: returns comments for livestream _id
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CommentModelResponse'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Comments
 *     summary: Creates comment for livestream
 *     operationId: createCommentByLivestreamId
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: livestream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: livestream _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/CommentModel'
 *     responses:
 *       '201':
 *         description: returns created comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/CommentModelResponseCreated'
 *
 * /live-streams/{liveStreamId}/comments/{commentId}:
 *   patch:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Comments
 *     summary: Updates comment by _id
 *     operationId: updateCommentById
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: livestream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: livestream _id
 *       - in: path
 *         name: commentId
 *         description: comment _id
 *         required: true
 *         schema:
 *           type: string
 *           description: comment _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/CommentModel'
 *     responses:
 *       '200':
 *         description: returns updated comment
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/CommentModelResponse'
 *   delete:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Comments
 *     summary: Removes comment of current livestream
 *     operationId: deleteCommentFromUser
 *     parameters:
 *       - in: path
 *         name: liveStreamId
 *         description: livestream _id
 *         required: true
 *         schema:
 *           type: string
 *           description: livestream _id
 *       - in: path
 *         name: commentId
 *         description: comment _id
 *         required: true
 *         schema:
 *           type: string
 *           description: comment _id
 *     responses:
 *       '204':
 *         description: Empty response
 */
class CommentController extends base_restdone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            dataSource: {
                type: 'mongoose',
                options: {
                    model: Comment,
                },
            },
            path: ['/:route/:target/comments'],
            fields: [
                {
                    name: 'author',
                    fields: ['username'],
                },
                'target',
                'targetModel',
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
            const { params, body, user: currentUser } = scope;
            const allowedTargetModel = comment_1.CommentRoutes.find((elem) => elem.route === params.route);
            delete params.route;
            if (!allowedTargetModel) {
                throw http_status_node_1.default.FORBIDDEN.createError();
            }
            params.targetModel = allowedTargetModel.targetModel;
            if (!currentUser) {
                throw new Error('No user');
            }
            if (!scope.isSelect()) {
                body.author = currentUser.id;
                body.target = params.target;
                body.targetModel = params.targetModel;
                if (!currentUser.isAdmin()) {
                    const comment = yield Comment.findOne({ _id: params._id }).lean();
                    if (comment && comment.author.toString() !== currentUser.id.toString()) {
                        throw http_status_node_1.default.FORBIDDEN.createError();
                    }
                }
            }
        });
    }
}
exports = CommentController;
module.exports = CommentController;
//# sourceMappingURL=comment.controller.js.map