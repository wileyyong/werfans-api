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
const strike_1 = require("../domains/strike");
const banning_1 = require("../domains/banning");
const { config: { banningStrategy: { strikeThreshold, }, }, consts: { events, }, modelProvider, modelProvider: { Strike, User, }, } = app_1.default;
exports.default = () => {
    const BanningService = {
        name: 'banning',
        events: {
            [events.strikes.created]: {
                handler(ctx) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { params: { targetUser } } = ctx;
                        const count = yield Strike.countDocuments({
                            targetUser,
                            state: { $ne: strike_1.StrikeState.Revoked },
                        });
                        if (count >= strikeThreshold) {
                            const hasJustBanned = yield User.ban(targetUser, { banningReasonType: banning_1.BanningReasonType.ByStrikes });
                            if (hasJustBanned) {
                                yield User.logout(targetUser);
                            }
                        }
                    });
                },
            },
            [events.strikes.revoked]: {
                handler(ctx) {
                    return __awaiter(this, void 0, void 0, function* () {
                        const { params: { ref, refModel, targetUser } } = ctx;
                        // if there is a referenced content (ref is not empty), it gets unbanned
                        if (ref && refModel) {
                            yield modelProvider[refModel].unban(ref);
                        }
                        // If the owner is banned with reason ByStrikes, and Strike threshold gets inactive,
                        // user gets unbanned
                        const count = yield Strike.countDocuments({
                            targetUser,
                            state: { $ne: strike_1.StrikeState.Revoked },
                        });
                        if (count < strikeThreshold) {
                            const user = yield User.findById(targetUser).select('banningReasonType').lean();
                            if (user && user.banningReasonType === banning_1.BanningReasonType.ByStrikes) {
                                yield User.unban(targetUser);
                            }
                        }
                    });
                },
            },
        },
    };
    return BanningService;
};
//# sourceMappingURL=banning.molecule.js.map