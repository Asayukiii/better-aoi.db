import { BetterAoiDatabase } from "../../core/BetterAoiDatabase";
import { BetterAoiDatabaseError } from "../../structures/BetterAoiDatabaseError";
import { BetterAoiDatabaseErrors } from "../../typings/enums/BetterAoiDatabaseErrors";

export default function ValidateDatabaseConnection(target: any, property: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value!;

    descriptor.value = function (this: BetterAoiDatabase) {
        if (!this.isReady()) {
            throw new BetterAoiDatabaseError(BetterAoiDatabaseErrors.DATABASE_NOT_OPEN)
        }

        return method.apply(this, arguments)
    }
}