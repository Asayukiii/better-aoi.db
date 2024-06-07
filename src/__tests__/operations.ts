import { BetterAoiDatabase } from "../core/BetterAoiDatabase";

const db = new BetterAoiDatabase()

function x(i: number) {
    const values = new Array(1000000).fill(0).map((x, y) => ({
        key: (i + y).toString(),
        value: { y: y + i }
    }))
    return values
}

async function perf() {
    const e = performance.now()
    await db.all()
    console.log(performance.now() - e)
    return 
}
db.connect()
    .then(async d => {
        await perf()
        await perf()
        await perf()
        await perf()
        await perf()
        await perf()
        await perf()
        
    })