"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Mutex = void 0;
class Mutex {
    _locked = false;
    _queue = [];
    lock() {
        const promise = new Promise(resolve => this._queue.push(resolve));
        if (!this._locked) {
            this._locked = true;
            this.unlock();
        }
        return promise;
    }
    unlock() {
        const next = this._queue.shift();
        if (!next) {
            if (this._locked)
                this._locked = false;
            return;
        }
        next();
    }
}
exports.Mutex = Mutex;
//# sourceMappingURL=Mutex.js.map