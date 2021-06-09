import BaseController from 'app/lib/base.controldone.controller';
import build from '../../../build.json';

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

class MetaController extends BaseController {
  constructor(options = {}) {
    Object.assign(options, {
      path: '/meta',
      actions: {
        getHealth: BaseController.createAction({
          auth: false,
          method: 'get',
          path: 'health',
        }),
        getBuild: BaseController.createAction({
          auth: false,
          method: 'get',
          path: 'build',
        }),
      },
    });

    super(options);
  }

  async getHealth() {
    return 'Server is running';
  }

  async getBuild() {
    return build;
  }
}

export default MetaController;
