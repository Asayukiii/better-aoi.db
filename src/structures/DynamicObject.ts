import { BetterAoiDatabaseEncoder } from "../core/BetterAoiDatabaseEncoder";
import { DynamicObjectEvents } from "../typings/interfaces/DynamicObjectEvents";
import { UnknownMethod } from "../typings/types/UnknownMethod";

export class DynamicObject<V = unknown, K extends DynamicObjectEvents = DynamicObjectEvents> {
    private __events: Record<keyof K, UnknownMethod | UnknownMethod[]> = {} as Record<keyof K, UnknownMethod>
    private __calls: Record<keyof K, number> = {} as Record<keyof K, number>

    #object: Record<string, V> = {}
    #maxSize = 0
    #size = 0

    constructor(entries?: [string, V][]) {
        if (entries) {
            const len = entries.length;
            for (let i = 0;i < len;i++) {
                const entry = entries[i]
                this.#object[entry[0]] = entry[1]
                this.#size++
            }
        }

        this.#free()
    }

    get size() {
        return this.#size
    }

    /**
     * Limits the number of properties in this object.
     * @param size 
     * @returns 
     */
    allocate(size: number) {
        this.#maxSize = size
        return this
    }

    toBuffer() {
        return BetterAoiDatabaseEncoder.create().encode([this.data]).buffer
    }

    #free() {
        if (this.#maxSize === 0) return;
        
        if (this.#size > this.#maxSize) {
            const keys = this.keys
            while (this.#size > this.#maxSize) {
                this.delete(keys.shift() as string)
            }
        }
    }

    set(key: string, value: V): this {
        if (!this.has(key)) {
            this.#size++
        }

        this.#object[key] = value

        //@ts-ignore
        this.emit("set", key, value)

        this.#free()

        return this
    }

    has(key: string): boolean {
        return this.#object[key] !== undefined
    }

    clear(): this {
        this.#object = {}
        this.#size = 0
        return this
    }

    delete(key: string): this {
        if (this.has(key)) {
            this.#size--
        }

        delete this.#object[key];

        //@ts-ignore
        this.emit("delete", key)

        return this
    }

    *iterate(offset = 0): Generator<V, void, unknown> {
        const keys = offset < 1 ? this.keys.slice(offset) : this.keys
        
        let y = 0;
        while (true) {
            yield this.data[keys[y]];
            y++ 
            if (keys[y] === undefined) {
                break
            } 
        }
    }

    removeAllListeners(): number {
        const evs = this.__events
        this.__events = {} as DynamicObject<V, K>["__events"]
        return Object.values(evs).reduce((x, y) => x + (Array.isArray(y) ? y.length : 1), 0)   
    }
    
    removeListeners<T extends keyof K>(event: T): number {
        const n = this.__events[event]
        delete this.__events[event]
        return Array.isArray(n) ? n.length : 1
    }

    get iterator() {
        return this.iterate()
    }

    get data() {
        return this.#object
    }

    get keys() {
        return Object.keys(this.#object)
    }

    get entries() {
        return Object.entries(this.#object)
    }

    toString() {
        return JSON.stringify(this.data)
    }

    stringify() {
        return this.toString()
    }

    callCount(event: keyof K): number {
        return this.__calls[event] ?? 0
    }

    get(key: string): V | undefined {
        return this.data[key]
    }

    /**
     * Adds another type to this object.
     * @returns 
     */
    as<T = unknown, K extends DynamicObjectEvents = DynamicObjectEvents>(): DynamicObject<T | V, K> {
        return this as unknown as DynamicObject<T | V, K>
    }

    //@ts-ignore
    emit<T extends keyof K>(event: T, ...args: Parameters<K[T]>): this {
        const events = this.__events[event]
        
        if (!events) return this

        this.__calls[event] = this.__calls[event] + 1 || 1

        if (Array.isArray(events)) {
            events.map(ev => ev(...args))
        } else {
            events(...args)
        }

        return this
    }

    on<T extends keyof K>(event: T, listener: K[T]): this {
        const current = this.__events[event]
        if (current) {
            this.__events[event] = [current, event] as UnknownMethod[]
        } else {
            this.__events[event] = listener as unknown as UnknownMethod
        }
        return this
    }
}