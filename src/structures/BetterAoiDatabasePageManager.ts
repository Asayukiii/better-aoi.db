import { read } from "fs";
import { BetterAoiDatabase } from "../core/BetterAoiDatabase";
import { DatabasePageOptions } from "../typings/interfaces/DatabasePageOptions";
import { BetterAoiDatabasePage } from "./BetterAoiDatabasePage";

export class BetterAoiDatabasePageManager<K extends boolean = boolean> {
    /**
     * This cache consists in the key being the index of the page based on the hash.
     */
    cache = new Map<number, BetterAoiDatabasePage>()

    #db: BetterAoiDatabase<K>

    /**
     * The size of each hash.
     */
    static BetterAoi_SIZE = 4

    /**
     * The size of each page.
     */
    static BetterAoi_PAGE_SIZE = 12_000

    /**
     * The amount of BetterAoi per page.
     */
    static BetterAoi_PER_PAGE = 3_000

    constructor(db: BetterAoiDatabase<K>) {
        this.#db = db
    }

    rawHas(index: number) {
        return this.cache.has(index)
    }

    has(hash: number) {
        return this.cache.has(this.pageIDForBetterAoi(hash))
    }

    pageIDForBetterAoi(hash: number): number {
        return Math.floor(hash / BetterAoiDatabasePageManager.BetterAoi_PER_PAGE)
    }

    pageForBetterAoi(hash: number, options?: DatabasePageOptions): BetterAoiDatabasePage | null {
        const i = this.pageIDForBetterAoi(hash)
        return this.cache.get(i) ?? (options ? this.add(options) : null)
    }

    async readTo(id: number, alloc: Buffer, offset: number = 0) {
        return new Promise<void>((resolve, reject) => {
            read(this.#db.descriptor, alloc, offset, BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE, this.cache.get(id)?.start as number, (err) => {
                if (err) return reject(err.stack)
                resolve()
            })
        })
    }

    /**
     * Adds a database page to cache.
     * @param options The options of the page.
     */
    add(options: DatabasePageOptions): BetterAoiDatabasePage {
        const page = new BetterAoiDatabasePage(options)
        this.cache.set(page.id, page)
        return page 
    }
}