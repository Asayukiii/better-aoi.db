"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicObject = void 0;
const BetterAoiDatabaseEncoder_1 = require("../core/BetterAoiDatabaseEncoder");
class DynamicObject {
    __events = {};
    __calls = {};
    #object = {};
    #maxSize = 0;
    #size = 0;
    constructor(entries) {
        if (entries) {
            const len = entries.length;
            for (let i = 0; i < len; i++) {
                const entry = entries[i];
                this.#object[entry[0]] = entry[1];
                this.#size++;
            }
        }
        this.#free();
    }
    get size() {
        return this.#size;
    }
    allocate(size) {
        this.#maxSize = size;
        return this;
    }
    toBuffer() {
        return BetterAoiDatabaseEncoder_1.BetterAoiDatabaseEncoder.create().encode([this.data]).buffer;
    }
    #free() {
        if (this.#maxSize === 0)
            return;
        if (this.#size > this.#maxSize) {
            const keys = this.keys;
            while (this.#size > this.#maxSize) {
                this.delete(keys.shift());
            }
        }
    }
    set(key, value) {
        if (!this.has(key)) {
            this.#size++;
        }
        this.#object[key] = value;
        this.emit("set", key, value);
        this.#free();
        return this;
    }
    has(key) {
        return this.#object[key] !== undefined;
    }
    clear() {
        this.#object = {};
        this.#size = 0;
        return this;
    }
    delete(key) {
        if (this.has(key)) {
            this.#size--;
        }
        delete this.#object[key];
        this.emit("delete", key);
        return this;
    }
    *iterate(offset = 0) {
        const keys = offset < 1 ? this.keys.slice(offset) : this.keys;
        let y = 0;
        while (true) {
            yield this.data[keys[y]];
            y++;
            if (keys[y] === undefined) {
                break;
            }
        }
    }
    removeAllListeners() {
        const evs = this.__events;
        this.__events = {};
        return Object.values(evs).reduce((x, y) => x + (Array.isArray(y) ? y.length : 1), 0);
    }
    removeListeners(event) {
        const n = this.__events[event];
        delete this.__events[event];
        return Array.isArray(n) ? n.length : 1;
    }
    get iterator() {
        return this.iterate();
    }
    get data() {
        return this.#object;
    }
    get keys() {
        return Object.keys(this.#object);
    }
    get entries() {
        return Object.entries(this.#object);
    }
    toString() {
        return JSON.stringify(this.data);
    }
    stringify() {
        return this.toString();
    }
    callCount(event) {
        return this.__calls[event] ?? 0;
    }
    get(key) {
        return this.data[key];
    }
    as() {
        return this;
    }
    emit(event, ...args) {
        const events = this.__events[event];
        if (!events)
            return this;
        this.__calls[event] = this.__calls[event] + 1 || 1;
        if (Array.isArray(events)) {
            events.map(ev => ev(...args));
        }
        else {
            events(...args);
        }
        return this;
    }
    on(event, listener) {
        const current = this.__events[event];
        if (current) {
            this.__events[event] = [current, event];
        }
        else {
            this.__events[event] = listener;
        }
        return this;
    }
}
exports.DynamicObject = DynamicObject;
//# sourceMappingURL=DynamicObject.js.map