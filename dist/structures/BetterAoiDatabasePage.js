"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAoiDatabasePage = void 0;
const BetterAoiDatabaseFile_1 = require("../core/BetterAoiDatabaseFile");
const writeUInt32LE_1 = __importDefault(require("../functions/writeUInt32LE"));
const BetterAoiDatabasePageManager_1 = require("./BetterAoiDatabasePageManager");
class BetterAoiDatabasePage {
    options;
    constructor(options) {
        this.options = options;
    }
    get end() {
        return this.start + BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE;
    }
    position(hash) {
        return (hash - this.hashStart) * BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_SIZE;
    }
    positionWithOffset(hash) {
        return this.position(hash) + this.start;
    }
    get headers() {
        const alloc = Buffer.allocUnsafe(BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES);
        alloc.write('PAGE');
        (0, writeUInt32LE_1.default)(alloc, this.id, 4);
        (0, writeUInt32LE_1.default)(alloc, this.start - 16, 8);
        (0, writeUInt32LE_1.default)(alloc, this.end, 12);
        return alloc;
    }
    get hashStart() {
        return this.id * BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PER_PAGE;
    }
    get hashEnd() {
        return this.hashStart + BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PER_PAGE;
    }
    get id() {
        return this.options.index;
    }
    get start() {
        return this.options.start;
    }
}
exports.BetterAoiDatabasePage = BetterAoiDatabasePage;
//# sourceMappingURL=BetterAoiDatabasePage.js.map