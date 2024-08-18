"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAoiDatabaseErrors = void 0;
var BetterAoiDatabaseErrors;
(function (BetterAoiDatabaseErrors) {
    BetterAoiDatabaseErrors["CORRUPT_DATABASE_NAME"] = "Database name is corrupt ($1).";
    BetterAoiDatabaseErrors["CORRUPT_DATABASE_VERSION"] = "Database version is corrupt ($1).";
    BetterAoiDatabaseErrors["CORRUPT_ROW_COUNT"] = "Row count is corrupt ($1).";
    BetterAoiDatabaseErrors["PATH_NOT_A_FILE"] = "Given path is not a file.";
    BetterAoiDatabaseErrors["UNIQUE_CONSTRAINT_FAILED"] = "Key '$1' already exists in the database";
    BetterAoiDatabaseErrors["DATABASE_NOT_OPEN"] = "This operation requires the database open.";
    BetterAoiDatabaseErrors["CORRUPT_PAGE_COUNT"] = "Page count is corrupt ($1).";
    BetterAoiDatabaseErrors["DATABASE_CORRUPT_FILE"] = "Database file is corrupt or malformed.";
})(BetterAoiDatabaseErrors = exports.BetterAoiDatabaseErrors || (exports.BetterAoiDatabaseErrors = {}));
//# sourceMappingURL=BetterAoiDatabaseErrors.js.map