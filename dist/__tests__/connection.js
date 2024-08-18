"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BetterAoiDatabase_1 = require("../core/BetterAoiDatabase");
const db = new BetterAoiDatabase_1.BetterAoiDatabase();
db.connect()
    .then(async (c) => {
    console.log(`db open`);
});
//# sourceMappingURL=connection.js.map