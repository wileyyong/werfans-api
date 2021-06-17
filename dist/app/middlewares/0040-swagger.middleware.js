"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const swaggerUi = require('swagger-ui-express');
const YAML = require('yamljs');
exports.default = (expressApp, { config }) => {
    if (config.serveSwaggerDocs && !config.isMigration && !config.isTest) {
        const swaggerDocument = YAML.load(`${process.cwd()}/swagger.yml`);
        expressApp.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));
    }
};
//# sourceMappingURL=0040-swagger.middleware.js.map