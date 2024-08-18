"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Util = void 0;
class Util extends null {
    constructor() { }
    static mergeDefault(source, target) {
        const entries = Object.entries(target);
        for (let i = 0; i < entries.length; i++) {
            const [key, value] = entries[i];
            const current = source[key];
            if (current === undefined) {
                source[key] = value;
            }
            else if (typeof value === 'object') {
                if (current === null) {
                    continue;
                }
                if (typeof current === 'object' && !Array.isArray(current)) {
                    Util.mergeDefault(source[key], value);
                }
            }
        }
        return source;
    }
}
exports.Util = Util;
//# sourceMappingURL=Util.js.map