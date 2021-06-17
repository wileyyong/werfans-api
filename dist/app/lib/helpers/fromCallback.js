"use strict";
module.exports = (func) => new Promise((resolve, reject) => func((err, result) => (err ? reject(err) : resolve(result))));
//# sourceMappingURL=fromCallback.js.map