import { QueueEntry } from "../typings/types/QueueEntry";


export class Mutex {
    public _locked = false
    public _queue: QueueEntry[] = []

    public lock(): Promise<void> {
        const promise = new Promise<void>(resolve => this._queue.push(resolve));

        if (!this._locked) {
            this._locked = true;
            this.unlock();
        }

        return promise;
    }

    public unlock(): void {
        const next = this._queue.shift();

        if (!next) {
            if (this._locked) this._locked = false;

            return;
        }

        next();
    }
}
