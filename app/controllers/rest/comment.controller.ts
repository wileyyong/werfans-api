import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import { Scope } from '../../domains/app';
import { CommentDocument, CommentResource, CommentRoutes } from '../../domains/comment';

const { modelProvider: { Comment } } = app;

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

class CommentController extends BaseController<
CommentDocument,
Record<string, any>,
CommentResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
      },
    });
    super(options);
  }

  async pre(scope: Scope<CommentDocument>): Promise<void> {
    const { params, body, user: currentUser } = scope;
    const allowedTargetModel = CommentRoutes.find((elem) => elem.route === params.route);
    delete params.route;

    if (!allowedTargetModel) {
      throw HTTP_STATUSES.FORBIDDEN.createError();
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
        const comment = await Comment.findOne({ _id: params._id }).lean();

        if (comment && comment.author.toString() !== currentUser.id.toString()) {
          throw HTTP_STATUSES.FORBIDDEN.createError();
        }
      }
    }
  }
}

exports = CommentController;
module.exports = CommentController;
