"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const user_1 = require("../../app/domains/user");
module.exports = (seed, options) => {
    const { type = user_1.UserType.Entrepreneur, username = `username${seed}` } = options || {};
    return ({
        username,
        password: `password${seed}`,
        email: `${username}@email.com`,
        type,
    });
};
//# sourceMappingURL=user.data.js.map