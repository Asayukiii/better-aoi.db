import { BetterAoiDatabaseEncoder } from "../core/BetterAoiDatabaseEncoder";
import readUInt32LE from "../functions/readUInt32LE";

const enc = BetterAoiDatabaseEncoder.create()

const mydata = new Array(1000000).fill(1).map(c => ({
    name: 'owa'
}))

const encoded = enc.encode(mydata)

function perf() {
    const t = performance.now()
    const e = enc.encode(mydata)
    console.log(performance.now() - t, e.buffer.length)
    return perf
}

perf()()()()()()