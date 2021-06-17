"use strict";
/**
 * Created by mk on 09/12/18.
 */
const baseUrl = process.env.BASE_URL || 'http://localhost:1341';
const config = {
    baseUrl,
    baseAdminUrl: `${baseUrl}/admin`,
    client: {
        id: process.env.CLIENT_ID || 'default',
        secret: process.env.CLIENT_SECRET || 'default',
    },
};
module.exports = config;
module.exports = config;
//# sourceMappingURL=config.js.map