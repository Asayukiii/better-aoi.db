"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function getBetterAoiCode(key) {
    let hash = 0;
    const len = key.length;
    for (let i = 0; i < len; i++) {
        const code = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
    }
    return hash >>> 0;
}
exports.default = getBetterAoiCode;
//# sourceMappingURL=getBetterAoiCode.js.map