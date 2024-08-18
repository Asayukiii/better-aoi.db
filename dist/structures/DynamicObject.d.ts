/// <reference types="node" />
import { DynamicObjectEvents } from "../typings/interfaces/DynamicObjectEvents";
export declare class DynamicObject<V = unknown, K extends DynamicObjectEvents = DynamicObjectEvents> {
    #private;
    private __events;
    private __calls;
    constructor(entries?: [string, V][]);
    get size(): number;
    allocate(size: number): this;
    toBuffer(): Buffer;
    set(key: string, value: V): this;
    has(key: string): boolean;
    clear(): this;
    delete(key: string): this;
    iterate(offset?: number): Generator<V, void, unknown>;
    removeAllListeners(): number;
    removeListeners<T extends keyof K>(event: T): number;
    get iterator(): Generator<V, void, unknown>;
    get data(): Record<string, V>;
    get keys(): string[];
    get entries(): [string, V][];
    toString(): string;
    stringify(): string;
    callCount(event: keyof K): number;
    get(key: string): V | undefined;
    as<T = unknown, K extends DynamicObjectEvents = DynamicObjectEvents>(): DynamicObject<T | V, K>;
    emit<T extends keyof K>(event: T, ...args: Parameters<K[T]>): this;
    on<T extends keyof K>(event: T, listener: K[T]): this;
}
//# sourceMappingURL=DynamicObject.d.ts.map