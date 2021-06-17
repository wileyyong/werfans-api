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
const base_controldone_controller_1 = __importDefault(require("app/lib/base.controldone.controller"));
const app_1 = __importDefault(require("app"));
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
const { config: { billing: { webhookSecret: allowableWebhookSecret, clientAccnum: allowableClientAccnum, clientSubacc: allowableClientSubacc, }, isTest, }, createLog, } = app_1.default;
const log = createLog(module);
class BillingController extends base_controldone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            path: '/billing',
            actions: {
                webhook: base_controldone_controller_1.default.createAction({
                    auth: false,
                    method: 'post',
                    path: 'webhook/:secret',
                }),
            },
        });
        super(options);
    }
    webhook(scope) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                log.info('Request came with body', scope.body);
                const { secret } = scope.params;
                if (secret !== allowableWebhookSecret) {
                    throw new Error(`Wrong secret "${secret}"`);
                }
                const { clientAccnum, clientSubacc, eventType } = scope.query;
                if (clientAccnum !== allowableClientAccnum || clientSubacc !== allowableClientSubacc) {
                    throw new Error(`Wrong account details "${clientAccnum}:${clientSubacc}"`);
                }
                yield app_1.default.ccBillService.handleEvent(eventType, scope.body);
                return { accepted: true };
            }
            catch (err) {
                log.warn(`Error: ${err.message}. Ignoring the request`);
                return isTest
                    ? {
                        accepted: false,
                        error: err.message,
                    }
                    : {};
            }
        });
    }
}
exports.default = BillingController;
//# sourceMappingURL=billing.controller.js.map