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
const swig_templates_1 = __importDefault(require("swig-templates"));
const app_1 = __importDefault(require("app"));
const fromCallback_1 = __importDefault(require("app/lib/helpers/fromCallback"));
const { config: { i18n: { defaultLocale }, isTest, ses: { from } } } = app_1.default;
const log = app_1.default.createLog(module);
class EmailService {
    constructor() {
        if (isTest) {
            this.sentEmails = [];
        }
    }
    init() {
        return __awaiter(this, void 0, void 0, function* () {
            this.emails = app_1.default.emails.reduce((result, emailBuilder) => {
                result[emailBuilder.name] = emailBuilder;
                return result;
            }, {});
            app_1.default.registerProvider('emailService', this);
        });
    }
    sendEmail(emailType, params) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const emailBuilder = this.emails[emailType];
                const { email, locale, payload } = params;
                const template = this.buildTemplatePath(emailBuilder.templateName, locale);
                const templateData = emailBuilder.buildData(payload);
                const compiledTemplate = templateData
                    ? (yield fromCallback_1.default((callback) => {
                        swig_templates_1.default.compileFile(template, {}, callback);
                    }))
                    : template;
                const html = templateData
                    ? compiledTemplate(templateData)
                    : compiledTemplate;
                const mailOptions = {
                    to: email,
                    from,
                    subject: emailBuilder.buildSubject(payload),
                    html,
                };
                log.info(`Sending mail to: ${mailOptions.to}`);
                if (!isTest) {
                    yield app_1.default.moleculerBroker.call('email.send', mailOptions);
                }
                else {
                    log.debug('emailService._sendEmail stub called');
                    this.sentEmails.push(mailOptions);
                }
                return true;
            }
            catch (err) {
                log.error(`Cannot send mail: ${err}`);
                return false;
            }
        });
    }
    buildTemplatePath(name, locale = defaultLocale) {
        return `app/views/${locale}/templates/${name}.email.view.html`;
    }
}
exports.default = new EmailService();
//# sourceMappingURL=email.service.js.map