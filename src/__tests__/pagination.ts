import { BetterAoiDatabase } from "../core/BetterAoiDatabase";
import { BetterAoiDatabasePage } from "../structures/BetterAoiDatabasePage";

const db = new BetterAoiDatabase()

db.connect()
.then(async d => {
    console.log(
        await d.file.size(),
        d.pages.cache.values().next().value.end
    )
})