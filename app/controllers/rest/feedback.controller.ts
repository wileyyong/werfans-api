import app from 'app';
import HTTP_STATUSES from 'http-status-node';
import BaseController from 'app/lib/base.restdone.controller';
import { Scope } from '../../domains/app';
import { FeedbackDocument, FeedbackResource } from '../../domains/feedback';

const { modelProvider: { Feedback } } = app;

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

class FeedbackController extends BaseController<
FeedbackDocument,
Record<string, any>,
FeedbackResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
        update: BaseController.createAction({
          enabled: false,
        }),
      },
    });
    super(options);
  }

  async pre(scope: Scope<FeedbackDocument>): Promise<void> {
    const { body, params } = scope;
    const user = this.getUserStrict(scope);
    if (scope.isSelect() && !user.isAdmin() && !scope.isResourceOwner(user.id, params.author)) {
      throw HTTP_STATUSES.FORBIDDEN.createError('You do not have permission to access this feedback.');
    }
    if (!scope.isSelect() || !user.isAdmin()) {
      params.author = user.id;
      body.author = user.id;
    }
  }
}

export default FeedbackController;
