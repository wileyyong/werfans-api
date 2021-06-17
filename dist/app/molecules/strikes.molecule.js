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
const notification_1 = require("../domains/notification");
const { consts: { events, }, } = app_1.default;
exports.default = () => {
    const StrikesService = {
        name: 'strikes',
        events: {
            [events.strikes.created]: {
                handler(ctx) {
                    return __awaiter(this, void 0, void 0, function* () {
                        return app_1.default.notificationService.createNotification({
                            notificationType: notification_1.NotificationType.StrikeCreated,
                            body: 'Strike created',
                            metadata: {
                                strike: ctx.params._id,
                            },
                            recipients: [ctx.params.targetUser],
                        });
                    });
                },
            },
        },
    };
    return StrikesService;
};
//# sourceMappingURL=strikes.molecule.js.map