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
const base_restdone_controller_1 = __importDefault(require("app/lib/base.restdone.controller"));
const app_1 = __importDefault(require("app"));
const { modelProvider: { Report } } = app_1.default;
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
class ReportController extends base_restdone_controller_1.default {
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
            const user = this.getUserStrict(scope);
            if (!scope.isSelect() || !user.isAdmin()) {
                // Preventing using other users ID, forcing to set author to the current user
                scope.params.author = user.id;
                scope.body.author = user.id;
            }
        });
    }
}
exports.default = ReportController;
//# sourceMappingURL=report.controller.js.map