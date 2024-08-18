"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
function default_1(buf, value, offset = 0) {
    value = +value;
    buf[offset++] = value;
    value = value >>> 8;
    buf[offset++] = value;
    value = value >>> 8;
    buf[offset++] = value;
    value = value >>> 8;
    buf[offset++] = value;
    return offset;
}
exports.default = default_1;
//# sourceMappingURL=writeUInt32LE.js.map