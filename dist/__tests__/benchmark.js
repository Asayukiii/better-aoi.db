"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const benchmark_1 = require("benchmark");
const BetterAoiDatabase_1 = require("../core/BetterAoiDatabase");
const BetterAoiDatabaseEncoder_1 = require("../core/BetterAoiDatabaseEncoder");
const enc = BetterAoiDatabaseEncoder_1.BetterAoiDatabaseEncoder.create();
const values = new Array(1).fill(1).map(c => ({ lol: 'aoibird' }));
const encoded = enc.encode(values);
const d = JSON.stringify(values);
const db = new BetterAoiDatabase_1.BetterAoiDatabase();
db.connect()
    .then(async (c) => {
    new benchmark_1.Suite()
        .add("Encoder#encode", () => {
        enc.encode(values);
    })
        .add("Encoder#decode", () => {
        enc.decode(encoded.buffer);
    })
        .add("Database#get", async () => {
        await db.get("aoi");
    })
        .add("Database#insert", async () => {
        await db.insert("aoi", { lol: 1 }).catch(() => null);
    })
        .on('complete', function () {
        console.log('Fastest is ' + this.filter('fastest').map('name')[0]);
    })
        .on("cycle", (event) => {
        console.log(String(event.target));
    })
        .run();
});
//# sourceMappingURL=benchmark.js.map