import BaseController from 'app/lib/base.controldone.controller';
import app from 'app';

const { consts: { METADATA } } = app;
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

class MetaController extends BaseController {
  constructor(options = {}) {
    Object.assign(options, {
      path: '/metadata',
      actions: {
        getMetadata: BaseController.createAction({
          method: 'get',
          path: '',
        }),
      },
    });

    super(options);
  }

  async getMetadata() {
    return METADATA;
  }
}

export default MetaController;
