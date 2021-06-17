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
const { consts: { METADATA } } = app_1.default;
/**
 * @swagger
 *
 * components:
 *   schemas:
 *     DictionaryMetadata:
 *       type: object
 *       properties:
 *         id:
 *           type: string;
 *         name:
 *           type: string;
 * /metadata:
 *   get:
 *     tags:
 *       - Metadata
 *     summary: Gets app metadata
 *     operationId: getMetadata
 *     responses:
 *       '200':
 *         description: 'App metadata'
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 serviceTypes:
 *                   type: array
 *                   item:
 *                     $ref: '#/components/schemas/DictionaryMetadata'
 *                 industry:
 *                   type: array
 *                   item:
 *                     $ref: '#/components/schemas/DictionaryMetadata'
 *                 office:
 *                   type: array
 *                   item:
 *                     $ref: '#/components/schemas/DictionaryMetadata'
 *                 region:
 *                   type: array
 *                   item:
 *                     $ref: '#/components/schemas/DictionaryMetadata'
 *                 pitchDeck:
 *                   type: array
 *                   item:
 *                     $ref: '#/components/schemas/DictionaryMetadata'
 *
*/
class MetaController extends base_controldone_controller_1.default {
    constructor(options = {}) {
        Object.assign(options, {
            path: '/metadata',
            actions: {
                getMetadata: base_controldone_controller_1.default.createAction({
                    method: 'get',
                    path: '',
                }),
            },
        });
        super(options);
    }
    getMetadata() {
        return __awaiter(this, void 0, void 0, function* () {
            return METADATA;
        });
    }
}
exports.default = MetaController;
//# sourceMappingURL=metadata.controller.js.map