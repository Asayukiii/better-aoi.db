"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAoiDatabaseEncoder = void 0;
const readUInt32LE_1 = __importDefault(require("../functions/readUInt32LE"));
const writeUInt32LE_1 = __importDefault(require("../functions/writeUInt32LE"));
class BetterAoiDatabaseEncoder {
    bufferSize;
    static BUFFER_SIZE = 16_384;
    constructor(size) {
        this.bufferSize = size;
    }
    static create() {
        return new BetterAoiDatabaseEncoder(this.BUFFER_SIZE);
    }
    encode(data) {
        const len = data.length;
        let allocated = Buffer.allocUnsafe(Math.floor(len / 100 + 1) * this.bufferSize);
        const bytes = [];
        let left = allocated.length;
        let pos = 0;
        for (let i = 0; i < len; i++) {
            const json = JSON.stringify(data[i]);
            const len = json.length + 4;
            while (len > left) {
                allocated = BetterAoiDatabaseEncoder.expand(allocated);
                left += this.bufferSize;
            }
            (0, writeUInt32LE_1.default)(allocated, len - 4, pos);
            allocated.write(json, pos + 4);
            left -= len;
            bytes.push(len);
            pos += len;
        }
        return {
            buffer: allocated = BetterAoiDatabaseEncoder.partition(allocated, pos),
            bytes
        };
    }
    static partition(buff, size) {
        const left = 16 - size % 16;
        if (left === 16) {
            if (buff.length === size)
                return buff;
            return buff.slice(0, size);
        }
        ;
        return buff.slice(0, size + left);
    }
    static expand(buff) {
        return Buffer.concat([
            buff,
            Buffer.allocUnsafe(this.BUFFER_SIZE)
        ], buff.length + this.BUFFER_SIZE);
    }
    decode(buffer) {
        const raw = [];
        const len = buffer.length;
        let pos = 0;
        for (;;) {
            const size = (0, readUInt32LE_1.default)(buffer, pos);
            const utf8 = buffer.toString('utf-8', pos + 4, pos + 4 + size);
            if (utf8[0] !== '{') {
                break;
            }
            raw.push(utf8);
            pos += 4 + size;
        }
        return JSON.parse(`[${raw.join(',')}]`);
    }
}
exports.BetterAoiDatabaseEncoder = BetterAoiDatabaseEncoder;
//# sourceMappingURL=BetterAoiDatabaseEncoder.js.map