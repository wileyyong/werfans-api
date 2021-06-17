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
// @ts-ignore
const moleculer_bee_queue_1 = __importDefault(require("moleculer-bee-queue"));
const aws_sdk_1 = __importDefault(require("aws-sdk"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const app_1 = __importDefault(require("app"));
const QUEUE_NAME = 'mail.send';
const { config: { ses: sesConfig, redis } } = app_1.default;
exports.default = () => {
    const EmailService = {
        name: 'email',
        mixins: [moleculer_bee_queue_1.default({ redis })],
        settings: {},
        actions: {
            send: {
                params: {
                    properties: {
                        subject: { type: 'string' },
                        to: { type: 'string', format: 'email' },
                        from: { type: 'string', format: 'email' },
                        html: { type: 'string' },
                    },
                    required: ['subject', 'to', 'from', 'html'],
                },
                handler(ctx) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const job = this.createJob(QUEUE_NAME, ctx.params);
                        this.logger.info(`Email job for ${job.data.to} created`);
                        yield job.retries(2).save();
                    });
                },
            },
        },
        queues: {
            [QUEUE_NAME](job) {
                return __awaiter(this, void 0, void 0, function* () {
                    try {
                        this.logger.info('Sending new mail to', job.data.to);
                        yield this.transport.sendMail(job.data);
                    }
                    catch (err) {
                        this.logger.error('Cannot send email to', job.data.to);
                        this.logger.error(err);
                        throw err;
                    }
                });
            },
        },
        methods: {},
        started() {
            return __awaiter(this, void 0, void 0, function* () {
                const ses = new aws_sdk_1.default.SES(sesConfig);
                this.transport = nodemailer_1.default.createTransport({
                    SES: ses,
                });
            });
        },
    };
    return EmailService;
};
//# sourceMappingURL=email.molecule.js.map