import { Suite } from "benchmark";
import { BetterAoiDatabase } from "../core/BetterAoiDatabase";
import { BetterAoiDatabaseEncoder } from "../core/BetterAoiDatabaseEncoder";

const enc = BetterAoiDatabaseEncoder.create()

const values = new Array(1).fill(1).map(c => ({ lol: 'aoibird' }))

const encoded = enc.encode(values)

const d = JSON.stringify(values)

const db = new BetterAoiDatabase()

db.connect()
.then(async c => {
    
    new Suite()
    .add("Encoder#encode", () => {
        enc.encode(values)
    })
    .add("Encoder#decode", () => {
        enc.decode(encoded.buffer)
    })
    .add("Database#get", async () => {
        await db.get("aoi")
    })
    .add("Database#insert", async () => {
        await db.insert("aoi", { lol: 1 }).catch(() => null)
    })
    .on('complete', function(this: any) {
        console.log('Fastest is ' + this.filter('fastest').map('name')[0]);
    })
    .on("cycle", (event: any) => {
        console.log(String(event.target))
    })
    .run()
})