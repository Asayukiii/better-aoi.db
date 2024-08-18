/// <reference types="node" />
import { Mutex } from "../structures/Mutex";
import { HeadersData } from "../typings/interfaces/HeadersData";
import { VerifiedPageData } from "../typings/interfaces/VerifiedPageData";
import { BetterAoiDatabase } from "./BetterAoiDatabase";
export declare class BetterAoiDatabaseFile<K extends boolean = boolean> {
    #private;
    mutex: Mutex;
    headers: HeadersData;
    static MINIMUM_BYTES: number;
    static HEADER_SIZE: number;
    static DATABASE_NAME: string;
    static DATABASE_VERSION: number;
    constructor(db: BetterAoiDatabase<K>);
    get descriptor(): number;
    verifyPageData(bytes: Buffer, offset?: number): VerifiedPageData | null;
    readAll(): Promise<Buffer>;
    truncate(size: number): Promise<boolean>;
    setRow(amount: number): Promise<boolean>;
    close(): Promise<boolean>;
    clear(): Promise<boolean>;
    size(): Promise<number>;
    read(position: number, size: number): Promise<Buffer>;
    subRow(amount?: number): Promise<boolean>;
    addRow(amount?: number): Promise<boolean>;
    write(bytes: Buffer, position?: number): Promise<boolean>;
    createHeaders(): Promise<boolean>;
    addPage(amount?: number): Promise<boolean>;
    setPageCount(amount: number): Promise<boolean>;
    fetchHeaders(): Promise<this>;
    isNewFile(): Promise<boolean>;
    readFromTo(from: number, to: number): Promise<Buffer>;
}
//# sourceMappingURL=BetterAoiDatabaseFile.d.ts.map