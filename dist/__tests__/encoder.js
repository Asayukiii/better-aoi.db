"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BetterAoiDatabaseEncoder_1 = require("../core/BetterAoiDatabaseEncoder");
const enc = BetterAoiDatabaseEncoder_1.BetterAoiDatabaseEncoder.create();
const mydata = new Array(1000000).fill(1).map(c => ({
    name: 'owa'
}));
const encoded = enc.encode(mydata);
function perf() {
    const t = performance.now();
    const e = enc.encode(mydata);
    console.log(performance.now() - t, e.buffer.length);
    return perf;
}
perf()()()()()();
//# sourceMappingURL=encoder.js.map