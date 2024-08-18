"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BetterAoiDatabase_1 = require("../core/BetterAoiDatabase");
const db = new BetterAoiDatabase_1.BetterAoiDatabase();
async function get() {
    const t = performance.now();
    const d = await db.get("1000");
    console.log(performance.now() - t, d);
    return get;
}
db.connect()
    .then(async () => {
    const t = performance.now();
    for (let i = 0; i < 1000; i++) {
        await db.insertUnsafe(i.toString(), { bor: 1 });
    }
    console.log(performance.now() - t);
});
//# sourceMappingURL=stress.js.map