import app from 'app';
import createAppError from 'app/lib/createAppError';
import BaseController from 'app/lib/base.restdone.controller';
import { Scope } from 'app/domains/app';
import { ReviewDocument, ReviewResource } from 'app/domains/review';

const {
  consts: {
    RULES: {
      ALLOW_FOR_ADMIN_ONLY_RULE,
    },
  },
  modelProvider: { Review },
} = app;

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

class ReviewController extends BaseController<
ReviewDocument,
Record<string, any>,
ReviewResource
> {
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
        default: BaseController.createAction({
          auth: [BaseController.AUTH.BEARER],
        }),
      },
    });
    super(options);
  }

  async pre(scope: Scope<ReviewDocument>): Promise<void> {
    if (!scope.isAdminMode) {
      const user = this.getUserStrict(scope);
      if (scope.isSelect()) {
        const { params: { targetUser } } = scope;
        if (!targetUser) {
          throw createAppError(ALLOW_FOR_ADMIN_ONLY_RULE);
        }
      } else {
        scope.overrideField('author', user._id);
      }
    }
  }

  async afterChange(scope: Scope<ReviewDocument>): Promise<void> {
    const { model } = scope;
    // @ts-ignore
    const targetUser = model.targetUser._id || model.targetUser;
    await app.moleculerBroker.call('rating.update', { targetUser: targetUser.toString() });
  }
}

export default ReviewController;
