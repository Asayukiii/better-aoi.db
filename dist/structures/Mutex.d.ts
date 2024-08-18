import { QueueEntry } from "../typings/types/QueueEntry";
export declare class Mutex {
    _locked: boolean;
    _queue: QueueEntry[];
    lock(): Promise<void>;
    unlock(): void;
}
//# sourceMappingURL=Mutex.d.ts.map