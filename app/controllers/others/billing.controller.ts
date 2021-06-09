import BaseController from 'app/lib/base.controldone.controller';
import app from 'app';
import { Scope } from 'controldone';
import { ICcBill } from '../../domains/ICcBill';

/**
 * @swagger
 *
 *  /billing/webhook/:secret:
 *   post:
 *     tags:
 *       - Billing
 *     summary: Billing webhook
 *     responses:
 *       '200':
 *         description: ''
 */

const {
  config: {
    billing: {
      webhookSecret: allowableWebhookSecret,
      clientAccnum: allowableClientAccnum,
      clientSubacc: allowableClientSubacc,
    },
    isTest,
  },
  createLog,
} = app;

const log = createLog(module);

interface BillingControllerBody {

}

interface BillingControllerParams {
  secret: string;
}

class BillingController extends BaseController {
  constructor(options = {}) {
    Object.assign(options, {
      path: '/billing',
      actions: {
        webhook: BaseController.createAction({
          auth: false,
          method: 'post',
          path: 'webhook/:secret',
        }),
      },
    });

    super(options);
  }

  async webhook(scope: Scope<BillingControllerBody, BillingControllerParams>) {
    try {
      log.info('Request came with body', scope.body);
      const { secret } = scope.params;
      if (secret !== allowableWebhookSecret) {
        throw new Error(`Wrong secret "${secret}"`);
      }
      const { clientAccnum, clientSubacc, eventType } = <ICcBill.WebhookInQuery>scope.query;
      if (clientAccnum !== allowableClientAccnum || clientSubacc !== allowableClientSubacc) {
        throw new Error(`Wrong account details "${clientAccnum}:${clientSubacc}"`);
      }
      await app.ccBillService.handleEvent(eventType, <ICcBill.WebhookInDto>scope.body);
      return { accepted: true };
    } catch (err) {
      log.warn(`Error: ${err.message}. Ignoring the request`);
      return isTest
        ? {
          accepted: false,
          error: err.message,
        }
        : {};
    }
  }
}

export default BillingController;
