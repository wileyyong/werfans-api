"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VERIFY_EMAIL_SCHEMA = void 0;
/**
 * Created by mk on 19/11/2016.
 */
exports.VERIFY_EMAIL_SCHEMA = {
    properties: {
        password: {
            type: 'string',
        },
    },
    required: ['password'],
    additionalProperties: true,
};
//# sourceMappingURL=emailVerification-plugin.schema.js.map