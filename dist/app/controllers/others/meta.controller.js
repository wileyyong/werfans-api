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
const build_json_1 = __importDefault(require("../../../build.json"));
/**
 * @swagger
 *
 *  /meta/health:
 *   get:
 *     tags:
 *       - Meta
 *     summary: Services status
 *     operationId: metaStatus
 *     responses:
 *       '200':
 *         description: 'Server is running'
 * /meta/build:
 *   get:
 *     tags:
 *       - Meta
 *     summary: Meta build
 *     operationId: metaBuild
 *     responses:
 *       '200':
 *         description: 'Build information'
 */
class MetaController extends base_controldone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            path: '/meta',
            actions: {
                getHealth: base_controldone_controller_1.default.createAction({
                    auth: false,
                    method: 'get',
                    path: 'health',
                }),
                getBuild: base_controldone_controller_1.default.createAction({
                    auth: false,
                    method: 'get',
                    path: 'build',
                }),
            },
        });
        super(options);
    }
    getHealth() {
        return __awaiter(this, void 0, void 0, function* () {
            return 'Server is running';
        });
    }
    getBuild() {
        return __awaiter(this, void 0, void 0, function* () {
            return build_json_1.default;
        });
    }
}
exports.default = MetaController;
//# sourceMappingURL=meta.controller.js.map