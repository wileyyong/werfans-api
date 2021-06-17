"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function restdone(restdoneController, options = {}) {
    const { field = '_id', replacePattern = 'me', replacer = ({ user }) => user && user.id, } = options;
    const { actions } = restdoneController;
    Object.values(actions).forEach((action) => {
        const { handler: originalHandler = () => { } } = action;
        action.handler = function handler(scope) {
            const { params } = scope;
            if (params[field] === replacePattern) {
                const newValue = replacer(scope);
                if (!newValue) {
                    throw new Error(`Cannot find matching for ${replacePattern}`);
                }
                params[field] = newValue;
            }
            return originalHandler.call(this, scope);
        };
    });
}
const plugin = {
    restdone,
};
exports.default = plugin;
//# sourceMappingURL=me-replacer.restdone.plugin.js.map