"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(data) {
    const len = data.length;
    for (let i = 0; i < len; i++) {
        if (data[i] !== 0)
            return false;
    }
    return true;
}
exports.default = default_1;
//# sourceMappingURL=isEmpty.js.map