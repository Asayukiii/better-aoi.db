"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BetterAoiDatabase_1 = require("../core/BetterAoiDatabase");
const db = new BetterAoiDatabase_1.BetterAoiDatabase();
function x(i) {
    const values = new Array(1000000).fill(0).map((x, y) => ({
        key: (i + y).toString(),
        value: { y: y + i }
    }));
    return values;
}
async function perf() {
    const e = performance.now();
    await db.all();
    console.log(performance.now() - e);
    return;
}
db.connect()
    .then(async (d) => {
    await perf();
    await perf();
    await perf();
    await perf();
    await perf();
    await perf();
    await perf();
});
//# sourceMappingURL=operations.js.map