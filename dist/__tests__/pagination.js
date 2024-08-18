"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BetterAoiDatabase_1 = require("../core/BetterAoiDatabase");
const db = new BetterAoiDatabase_1.BetterAoiDatabase();
db.connect()
    .then(async (d) => {
    console.log(await d.file.size(), d.pages.cache.values().next().value.end);
});
//# sourceMappingURL=pagination.js.map