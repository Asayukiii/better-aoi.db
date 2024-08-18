"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const BetterAoiDatabaseError_1 = require("../../structures/BetterAoiDatabaseError");
const BetterAoiDatabaseErrors_1 = require("../../typings/enums/BetterAoiDatabaseErrors");
function ValidateDatabaseConnection(target, property, descriptor) {
    const method = descriptor.value;
    descriptor.value = function () {
        if (!this.isReady()) {
            throw new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.DATABASE_NOT_OPEN);
        }
        return method.apply(this, arguments);
    };
}
exports.default = ValidateDatabaseConnection;
//# sourceMappingURL=ValidateDatabaseConnection.js.map