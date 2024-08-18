/// <reference types="node" />
import { DatabasePageOptions } from "../typings/interfaces/DatabasePageOptions";
export declare class BetterAoiDatabasePage {
    options: DatabasePageOptions;
    constructor(options: DatabasePageOptions);
    get end(): number;
    position(hash: number): number;
    positionWithOffset(hash: number): number;
    get headers(): Buffer;
    get hashStart(): number;
    get hashEnd(): number;
    get id(): number;
    get start(): number;
}
//# sourceMappingURL=BetterAoiDatabasePage.d.ts.map