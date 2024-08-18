"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(buff, offset = 0) {
    return buff[offset] +
        buff[offset + 1] * 2 ** 8 +
        buff[offset + 2] * 2 ** 16 +
        buff[offset + 3] * 2 ** 24;
}
exports.default = default_1;
//# sourceMappingURL=readUInt32LE.js.map