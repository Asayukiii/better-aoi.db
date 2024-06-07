import { BetterAoiDatabase } from "../core/BetterAoiDatabase";

const db = new BetterAoiDatabase()

db.connect()
.then(async c => {
    console.log(`db open`)
})