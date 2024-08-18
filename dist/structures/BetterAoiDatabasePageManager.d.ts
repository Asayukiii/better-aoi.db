/// <reference types="node" />
import { BetterAoiDatabase } from "../core/BetterAoiDatabase";
import { DatabasePageOptions } from "../typings/interfaces/DatabasePageOptions";
import { BetterAoiDatabasePage } from "./BetterAoiDatabasePage";
export declare class BetterAoiDatabasePageManager<K extends boolean = boolean> {
    #private;
    cache: Map<number, BetterAoiDatabasePage>;
    static BetterAoi_SIZE: number;
    static BetterAoi_PAGE_SIZE: number;
    static BetterAoi_PER_PAGE: number;
    constructor(db: BetterAoiDatabase<K>);
    rawHas(index: number): boolean;
    has(hash: number): boolean;
    pageIDForBetterAoi(hash: number): number;
    pageForBetterAoi(hash: number, options?: DatabasePageOptions): BetterAoiDatabasePage | null;
    readTo(id: number, alloc: Buffer, offset?: number): Promise<void>;
    add(options: DatabasePageOptions): BetterAoiDatabasePage;
}
//# sourceMappingURL=BetterAoiDatabasePageManager.d.ts.map