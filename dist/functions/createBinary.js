"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const writeUInt32LE_1 = __importDefault(require("./writeUInt32LE"));
function default_1(start) {
    const alloc = Buffer.allocUnsafe(4);
    (0, writeUInt32LE_1.default)(alloc, start);
    return alloc;
}
exports.default = default_1;
//# sourceMappingURL=createBinary.js.map