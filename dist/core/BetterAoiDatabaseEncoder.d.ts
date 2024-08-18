/// <reference types="node" />
import { EncodedData } from "../typings/interfaces/EncodedData";
import { DataResolvable } from "../typings/types/DataResolvable";
export declare class BetterAoiDatabaseEncoder {
    bufferSize: number;
    static BUFFER_SIZE: number;
    private constructor();
    static create(): BetterAoiDatabaseEncoder;
    encode(data: DataResolvable[]): EncodedData;
    static partition(buff: Buffer, size: number): Buffer;
    static expand(buff: Buffer): Buffer;
    decode(buffer: Buffer): DataResolvable[];
}
//# sourceMappingURL=BetterAoiDatabaseEncoder.d.ts.map