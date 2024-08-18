"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const readUInt32LE_1 = __importDefault(require("./readUInt32LE"));
function default_1(data) {
    return {
        start: (0, readUInt32LE_1.default)(data)
    };
}
exports.default = default_1;
//# sourceMappingURL=decodeBinary.js.map