import { BetterAoiDatabaseFile } from "../core/BetterAoiDatabaseFile";
import writeUInt32LE from "../functions/writeUInt32LE";
import { DatabasePageOptions } from "../typings/interfaces/DatabasePageOptions";
import { BetterAoiDatabasePageManager } from "./BetterAoiDatabasePageManager";

export class BetterAoiDatabasePage {
    options: DatabasePageOptions

    constructor(options: DatabasePageOptions) {
        this.options = options
    }

    /**
     * Returns the end of this page in bytes.
     */
    get end() {
        return this.start + BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE
    }

    /**
     * Returns the position of this hash in the page.
     * @param hash The hash to get it's position.
     * @returns 
     */
    position(hash: number) {
        return (hash - this.hashStart) * BetterAoiDatabasePageManager.BetterAoi_SIZE
    }

    /**
     * Returns the position of this hash in the page plus the offset of the page.
     * @param hash The hash to get it's position.
     */
    positionWithOffset(hash: number) {
        return this.position(hash) + this.start
    }

    get headers(): Buffer {
        const alloc = Buffer.allocUnsafe(BetterAoiDatabaseFile.MINIMUM_BYTES)
        alloc.write('PAGE')
        writeUInt32LE(alloc, this.id, 4)
        writeUInt32LE(alloc, this.start - 16, 8)
        writeUInt32LE(alloc, this.end, 12)

        return alloc
    }

    get hashStart() {
        return this.id * BetterAoiDatabasePageManager.BetterAoi_PER_PAGE
    }

    get hashEnd() {
        return this.hashStart + BetterAoiDatabasePageManager.BetterAoi_PER_PAGE
    }

    get id() {
        return this.options.index
    }

    get start() {
        return this.options.start
    }
}