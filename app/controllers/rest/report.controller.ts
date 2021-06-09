import BaseController from 'app/lib/base.restdone.controller';
import app from 'app';
import { ReportDocument, ReportResource } from '../../domains/report';
import { Scope } from '../../domains/app';

const { modelProvider: { Report } } = app;

/**
 * @swagger
 *
 * /reports:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reports
 *     summary: List all reports
 *     operationId: reportsList
 *     responses:
 *       '200':
 *         description: return an array of report objects
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/ReportModelResponse'
 *   post:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reports
 *     summary: Create report
 *     operationId: createReport
 *     requestBody:
 *       description: object containing the properties to create report
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ReportModel'
 *     responses:
 *       '201':
 *         description: return created report object
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               items:
 *                 $ref: '#/components/schemas/ReportModelResponse'
 * /reports/{_id}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reports
 *     summary: Returns report by _id
 *     operationId: getReports
 *     parameters:
 *       - in: path
 *         name: _id
 *         schema:
 *           type: string
 *         required: true
 *     responses:
 *       '200':
 *         description: returns report by _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ReportModelResponse'
 * /users/{userId}/reports/{reportId}:
 *   get:
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reports
 *     summary: Returns report by _id
 *     operationId: getReportById
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: reportId
 *         description: report _id
 *         required: true
 *         schema:
 *           type: string
 *           description: report _id
 *     responses:
 *       '200':
 *         description: returns reports for user _id
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ReportModelResponse'
 *   patch:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reports
 *     summary: Updates report by _id
 *     operationId: updateReportById
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: reportId
 *         description: report _id
 *         required: true
 *         schema:
 *           type: string
 *           description: report _id
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             $ref: '#/components/schemas/ReportModel'
 *     responses:
 *       '200':
 *         description: returns updated report
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               $ref: '#/components/schemas/ReportModelResponse'
 *   delete:
 *     deprecated: true
 *     security:
 *       - Bearer Token: []
 *       - OauthSecurity: []
 *     tags:
 *       - Reports
 *     summary: Removes report of current user
 *     operationId: deleteReportFromUser
 *     parameters:
 *       - in: path
 *         name: userId
 *         description: user _id
 *         required: true
 *         schema:
 *           type: string
 *           description: user _id
 *       - in: path
 *         name: reportId
 *         description: report _id
 *         required: true
 *         schema:
 *           type: string
 *           description: report _id
 *     responses:
 *       '204':
 *         description: Empty response
 */

class ReportController extends BaseController<
ReportDocument,
Record<string, any>,
ReportResource
> {
  constructor(options = {}) {
    options = options || {};
    Object.assign(options, {
      dataSource: {
        type: 'mongoose',
        options: {
          model: Report,
        },
      },
      path: ['/reports', '/users/:author/reports'],
      fields: [
        {
          name: 'author',
          fields: ['username'],
        },
        {
          name: 'complainUser',
          fields: ['username'],
        },
        'body',
        'photoUrl',
        'createdAt',
        'updatedAt',
      ],
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

  async pre(scope: Scope<ReportDocument>): Promise<void> {
    const user = this.getUserStrict(scope);
    if (!scope.isSelect() || !user.isAdmin()) {
      // Preventing using other users ID, forcing to set author to the current user
      scope.params.author = user.id;
      scope.body.author = user.id;
    }
  }
}

export default ReportController;
