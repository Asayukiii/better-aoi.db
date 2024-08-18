"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAoiDatabasePageManager = void 0;
const fs_1 = require("fs");
const BetterAoiDatabasePage_1 = require("./BetterAoiDatabasePage");
class BetterAoiDatabasePageManager {
    cache = new Map();
    #db;
    static BetterAoi_SIZE = 4;
    static BetterAoi_PAGE_SIZE = 12_000;
    static BetterAoi_PER_PAGE = 3_000;
    constructor(db) {
        this.#db = db;
    }
    rawHas(index) {
        return this.cache.has(index);
    }
    has(hash) {
        return this.cache.has(this.pageIDForBetterAoi(hash));
    }
    pageIDForBetterAoi(hash) {
        return Math.floor(hash / BetterAoiDatabasePageManager.BetterAoi_PER_PAGE);
    }
    pageForBetterAoi(hash, options) {
        const i = this.pageIDForBetterAoi(hash);
        return this.cache.get(i) ?? (options ? this.add(options) : null);
    }
    async readTo(id, alloc, offset = 0) {
        return new Promise((resolve, reject) => {
            (0, fs_1.read)(this.#db.descriptor, alloc, offset, BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE, this.cache.get(id)?.start, (err) => {
                if (err)
                    return reject(err.stack);
                resolve();
            });
        });
    }
    add(options) {
        const page = new BetterAoiDatabasePage_1.BetterAoiDatabasePage(options);
        this.cache.set(page.id, page);
        return page;
    }
}
exports.BetterAoiDatabasePageManager = BetterAoiDatabasePageManager;
//# sourceMappingURL=BetterAoiDatabasePageManager.js.map