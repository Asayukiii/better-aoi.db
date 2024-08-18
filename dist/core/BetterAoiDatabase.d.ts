import { BetterAoiDatabasePage } from "../structures/BetterAoiDatabasePage";
import { BetterAoiDatabasePageManager } from "../structures/BetterAoiDatabasePageManager";
import { BetterAoiDatabaseOptions } from "../typings/interfaces/BetterAoiDatabaseOptions";
import { DataResolvable } from "../typings/types/DataResolvable";
import { BetterAoiDatabaseFile } from "./BetterAoiDatabaseFile";
export declare class BetterAoiDatabase<K extends boolean = boolean> {
    #private;
    options: BetterAoiDatabaseOptions;
    pages: BetterAoiDatabasePageManager<K>;
    constructor(options?: BetterAoiDatabaseOptions);
    get descriptor(): number;
    get file(): BetterAoiDatabaseFile<K>;
    isReady(): this is BetterAoiDatabase<true>;
    createPage(page: BetterAoiDatabasePage): Promise<boolean>;
    getTotalRowCount(): number;
    close(): Promise<boolean>;
    clear(): Promise<boolean>;
    has(key: string | number): Promise<boolean>;
    get(key: string): Promise<DataResolvable | null>;
    insertMany(datas: {
        key: string;
        value: DataResolvable;
    }[]): Promise<void>;
    insertUnsafe(key: string, data: DataResolvable): Promise<void>;
    insert(key: string, data: DataResolvable): Promise<void>;
    delete(key: string): Promise<boolean>;
    all(): Promise<DataResolvable[]>;
    update(key: string, value: DataResolvable): Promise<boolean>;
    size(): Promise<number>;
    connect(): Promise<BetterAoiDatabase<true>>;
}
//# sourceMappingURL=BetterAoiDatabase.d.ts.map