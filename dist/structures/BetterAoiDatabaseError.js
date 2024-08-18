"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAoiDatabaseError = void 0;
class BetterAoiDatabaseError extends Error {
    constructor(err, ...params) {
        super(BetterAoiDatabaseError.#make(err, ...params));
    }
    static #make(err, ...params) {
        params.map((x, y) => err = err.replaceAll(`$${y + 1}`, `${x}`));
        return err;
    }
}
exports.BetterAoiDatabaseError = BetterAoiDatabaseError;
//# sourceMappingURL=BetterAoiDatabaseError.js.map