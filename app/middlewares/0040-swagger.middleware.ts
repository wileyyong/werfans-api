import { ExtendedExpressApplication } from '../domains/system';
import { App } from '../domains/app';

const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');

export default (expressApp: ExtendedExpressApplication, { config }: App) => {
  if (config.serveSwaggerDocs && !config.isMigration && !config.isTest) {
    const swaggerDocument = YAML.load(`${process.cwd()}/swagger.yml`);
    expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
  }
};
