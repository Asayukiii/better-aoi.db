import { existsSync, open, statSync, writeFileSync } from "fs";
import createBinary from "../functions/createBinary";
import decodeBinary from "../functions/decodeBinary";
import getBetterAoiCode from "../functions/getBetterAoiCode";
import isEmpty from "../functions/isEmpty";
import readUInt32LE from "../functions/readUInt32LE";
import writeUInt32LE from "../functions/writeUInt32LE";
import { BetterAoiDatabaseError } from "../structures/BetterAoiDatabaseError";
import { BetterAoiDatabasePage } from "../structures/BetterAoiDatabasePage";
import { BetterAoiDatabasePageManager } from "../structures/BetterAoiDatabasePageManager";
import { BetterAoiDatabaseErrors } from "../typings/enums/BetterAoiDatabaseErrors";
import { BetterAoiDatabaseOptions } from "../typings/interfaces/BetterAoiDatabaseOptions";
import { DataResolvable } from "../typings/types/DataResolvable";
import { DefaultBetterAoiDatabaseOptions } from "../util/constants/DefaultBetterAoiDatabaseOptions";
import ValidateDatabaseConnection from "../util/decorators/ValidateDatabaseConnection";
import { Util } from "../util/Util";
import { BetterAoiDatabaseEncoder } from "./BetterAoiDatabaseEncoder";
import { BetterAoiDatabaseFile } from "./BetterAoiDatabaseFile";

export class BetterAoiDatabase<K extends boolean = boolean> {
    options: BetterAoiDatabaseOptions
    #encoder = BetterAoiDatabaseEncoder.create()
    #descriptor: number = -1
    #ready: boolean = false
    pages: BetterAoiDatabasePageManager<K> = new BetterAoiDatabasePageManager(this)
    #file: BetterAoiDatabaseFile<K> = new BetterAoiDatabaseFile<K>(this)

    constructor(options: BetterAoiDatabaseOptions = DefaultBetterAoiDatabaseOptions) {
        this.options = Util.mergeDefault(options, DefaultBetterAoiDatabaseOptions)    
        this.#validateOptions()
    }

    get descriptor() {
        return this.#descriptor
    }

    /**
     * The file is exposed like this to prevent end user overriding.
     */
    get file() {
        return this.#file
    }

    isReady(): this is BetterAoiDatabase<true> {
        return this.#ready
    }

    async #fetchPages() {
        const alloc = await this.#file.readAll()

        let pos = 0;
        let len = alloc.length

        for (;pos < len;) {
            const data = this.#file.verifyPageData(alloc, pos)

            pos += BetterAoiDatabaseFile.MINIMUM_BYTES

            if (!data) {
                continue
            }

            this.pages.add({
                start: data.start + BetterAoiDatabaseFile.MINIMUM_BYTES,
                index: data.index
            })
        }

        if (this.pages.cache.size !== this.#file.headers.pageCount) {
            throw new BetterAoiDatabaseError(
                BetterAoiDatabaseErrors.DATABASE_CORRUPT_FILE
            )
        }
    }

    createPage(page: BetterAoiDatabasePage): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const data = Buffer.concat(
                [
                    page.headers,
                    Buffer.alloc(BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE)
                ],
                BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile.MINIMUM_BYTES
            )

            this.#file.write(data)
                .then(() => {
                    this.#file.addPage()
                        .then(() => {
                            this.pages.cache.set(page.id, page)
                            resolve(true)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    #validateOptions() {
        if (existsSync(this.options.path) && !statSync(this.options.path).isFile()) {
            throw new BetterAoiDatabaseError(
                BetterAoiDatabaseErrors.PATH_NOT_A_FILE
            )
        }
    }

    @ValidateDatabaseConnection
    getTotalRowCount(): number {
        return this.#file.headers.rowCount
    }

    /**
     * Closes the database connection.
     * @returns 
     */
    @ValidateDatabaseConnection
    close(): Promise<boolean> {
        return this.#file.close()
            .then(() => {
                this.#descriptor = -1 
                this.#ready = false
                return true
            })
    }

    /**
     * Clears all the data in this file. (Headers will be kept)
     * @returns 
     */
    @ValidateDatabaseConnection
    clear(): Promise<boolean> {
        return this.#file.clear()
            .then(() => {
                this.pages.cache.clear()
                return true
            })
    }

    @ValidateDatabaseConnection
    has(key: string | number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = typeof key === 'number' ? key : getBetterAoiCode(key)

            const p = this.pages.pageForBetterAoi(BetterAoi)

            if (!p) return resolve(false)

            const pos = p.positionWithOffset(BetterAoi)

            const alloc = await this.#file.read(pos, 4)

            if (isEmpty(alloc)) {
                return resolve(false)
            }

            resolve(true)
        })
    }

    @ValidateDatabaseConnection
    get(key: string): Promise<DataResolvable | null> {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = getBetterAoiCode(key)

            const p = this.pages.pageForBetterAoi(BetterAoi)

            if (!p) {
                return resolve(null)
            }

            const pos = p.positionWithOffset(BetterAoi)

            const alloc = await this.#file.read(pos, 4)

            if (isEmpty(alloc)) {
                return resolve(null)
            }

            const bin = decodeBinary(alloc)

            const size = await this.#file.read(bin.start, 4)

            const data = await this.#file.read(bin.start + 4, readUInt32LE(size))

            resolve(JSON.parse(data.toString('utf-8')))
        })
    }

    @ValidateDatabaseConnection
    insertMany(datas: { key: string, value: DataResolvable }[]): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const BetterAoies: number[] = []
            
            const len = datas.length

            const pages = new Set<number>();

            const writer = new Map<number, { BetterAoi: number, size: number }[]>()

            const values: DataResolvable[] = []

            for (let i = 0;i < len;i++) {
                values.push(datas[i].value)
            }

            const encoded = this.#encoder.encode(values)

            for (let i = 0;i < len;i++) {
                const { key, value } = datas[i]
                
                const BetterAoi = getBetterAoiCode(key)

                const id = this.pages.pageIDForBetterAoi(BetterAoi);

                if (!writer.has(id)) writer.set(id, [])

                writer.get(id)?.push({ BetterAoi, size: encoded.bytes[i] })

                const page = this.pages.pageForBetterAoi(BetterAoi)

                if (pages.has(id)) {
                    BetterAoies.push(BetterAoi)
                    continue
                }

                if (await this.has(BetterAoi)) {
                    return reject(new BetterAoiDatabaseError(
                        BetterAoiDatabaseErrors.UNIQUE_CONSTRAINT_FAILED, key
                    ))
                }

                BetterAoies.push(BetterAoi)

                if (!page) pages.add(id)
            }

            const size = pages.size

            let currentSize = await this.#file.size()

            if (size) {
                const pageAlloc = Buffer.alloc(size * (BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile.MINIMUM_BYTES))

                let s = 0

                const entries = [...pages.values()]

                for (let i = 0;i < size;i++) {
                    const page = this.pages.add({ start: currentSize + BetterAoiDatabaseFile.MINIMUM_BYTES, index: entries[i] })
                    pageAlloc.write('PAGE', s)
                    writeUInt32LE(pageAlloc, page.id, s + 4)
                    writeUInt32LE(pageAlloc, page.start - BetterAoiDatabaseFile.MINIMUM_BYTES, s + 8)
                    writeUInt32LE(pageAlloc, page.end, s + 12)

                    s += BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile.MINIMUM_BYTES
                    currentSize += BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile.MINIMUM_BYTES
                }

                await this.#file.write(pageAlloc)
                await this.#file.addPage(size)
            }

            const ids = [...writer.keys()]
            const len1 = ids.length

            for (let x = 0;x < len1;x++) {
                const id = ids[x]
                const value = writer.get(id) as {
                    BetterAoi: number;
                    size: number;
                }[]
                
                const page = this.pages.cache.get(id) as BetterAoiDatabasePage

                const len = value.length

                const alloc = Buffer.alloc(BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE)

                await this.pages.readTo(id, alloc)

                for (let i = 0;i < len;i++) {
                    const { BetterAoi, size } = value[i]

                    const pos = page.position(BetterAoi)

                    writeUInt32LE(alloc, currentSize, pos)
                    currentSize += size
                }

                await this.#file.write(alloc, page.start)
            }

            await this.#file.addRow(len)

            await this.#file.write(encoded.buffer)
                .then(() => resolve())
                .catch(reject)
        })
    }

    /**
     * Unsafe inserting a value means you're aware this key DOES NOT exist in the database, if it does the prior value will be lost in the database.
     * @param key The key to unsafely insert. 
     * @param data The data of this key.
     */
    @ValidateDatabaseConnection
    insertUnsafe(key: string, data: DataResolvable): Promise<void> {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = getBetterAoiCode(key)

            const id = this.pages.pageIDForBetterAoi(BetterAoi)

            const page = this.pages.pageForBetterAoi(BetterAoi) ?? await this.createPage(new BetterAoiDatabasePage({
                index: id,
                start: await this.#file.size() + BetterAoiDatabaseFile.MINIMUM_BYTES
            })).then(c => this.pages.cache.get(id)) as BetterAoiDatabasePage
                
            const pos = page.positionWithOffset(BetterAoi)

            const encoded = this.#encoder.encode([data])

            const alloc = encoded.buffer

            const size = await this.#file.size();

            const bin = createBinary(size);

            this.#file.write(
                bin,
                pos
            ).then(async () => {
                await this.#file.addRow()

                this.file.write(alloc)
                    .then(() => resolve())
                    .catch(reject)
            })
            .catch(reject)
        })
    }

    @ValidateDatabaseConnection
    insert(key: string, data: DataResolvable): Promise<void> {
        return new Promise(async (resolve, reject) => {
            if (await this.has(key)) {
                return reject(new BetterAoiDatabaseError(
                    BetterAoiDatabaseErrors.UNIQUE_CONSTRAINT_FAILED, key
                ))
            }

            const BetterAoi = getBetterAoiCode(key)

            const id = this.pages.pageIDForBetterAoi(BetterAoi)

            const page = this.pages.pageForBetterAoi(BetterAoi) ?? await this.createPage(new BetterAoiDatabasePage({
                index: id,
                start: await this.#file.size() + BetterAoiDatabaseFile.MINIMUM_BYTES
            })).then(c => this.pages.cache.get(id)) as BetterAoiDatabasePage
                
            const pos = page.positionWithOffset(BetterAoi)

            const encoded = this.#encoder.encode([data])

            const alloc = encoded.buffer

            const size = await this.#file.size();

            const bin = createBinary(size);

            this.#file.write(
                bin,
                pos
            ).then(async () => {
                await this.#file.addRow()
                
                this.file.write(alloc)
                    .then(() => resolve())
                    .catch(reject)
            })
            .catch(reject)
        })
    }

    /**
     * Deletes a key from the database, this will not free the bytes.
     * @param key The key to delete.
     * @returns 
     */
    @ValidateDatabaseConnection
    delete(key: string): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = getBetterAoiCode(key)

            const page = this.pages.pageForBetterAoi(BetterAoi)

            if (!page) return resolve(false)

            const pos = page.positionWithOffset(BetterAoi)

            this.#file.write(Buffer.alloc(4), pos)
                .then(resolve)
                .catch(reject)
        })
    }


    /**
     * Retrieves all data in the database.
     */
    all(): Promise<DataResolvable[]> {
        return new Promise(async (resolve, reject) => {
            const alloc = await this.#file.read(0, await this.#file.size())

            const pages = [...this.pages.cache.keys()]

            const current = Buffer.allocUnsafe(alloc.length - BetterAoiDatabaseFile.HEADER_SIZE - (pages.length * BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE))

            let buffpos = 0

            for (let i = 0, len = pages.length;i < len;i++) {
                const page = this.pages.cache.get(pages[i]) as BetterAoiDatabasePage

                const part = alloc.slice(page.start, page.end)

                for (let pos = 0;pos !== BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE;pos += BetterAoiDatabasePageManager.BetterAoi_SIZE) {
                    const start = readUInt32LE(part, pos)

                    if (start === 0) {
                        continue
                    } 

                    const size = readUInt32LE(alloc, start)
                    writeUInt32LE(current, size, buffpos)
                    current.write(alloc.toString('utf-8', start + 4, start + 4 + size), buffpos + 4)
                    buffpos += size + 4
                }
            }

            resolve(this.#encoder.decode(current))
        })
    }

    /**
     * Updates a key value in the database.
     * @param key The key to update.
     * @param value The value to update this key with.
     * @returns 
     */
    @ValidateDatabaseConnection
    update(key: string, value: DataResolvable): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = getBetterAoiCode(key)

            const page = this.pages.pageForBetterAoi(BetterAoi)

            if (!page) return resolve(false)

            const pos = page.positionWithOffset(BetterAoi)

            const dataPos = await this.#file.read(pos, 4)

            const r = readUInt32LE(dataPos)

            if (r === 0) return resolve(false)

            const isize = await this.#file.read(r, 4)

            const size = readUInt32LE(isize)

            const encoded = this.#encoder.encode([ value ])

            const bytes = encoded.bytes[0] - 4
            const alloc = encoded.buffer

            if (bytes > size) {
                const datapos = await this.#file.size()
                await this.#file.write(
                    alloc,
                    datapos
                )
                .then(() => {
                    const buff = createBinary(datapos)
                    this.#file.write(
                        buff,
                        pos
                    )
                    .then(resolve)
                    .catch(reject)
                })
                .catch(reject)
            } else {
                await this.#file.write(
                    alloc,
                    r
                )
                .then(resolve)
                .catch(reject)
            }
        })
    }

    #open() {
        return new Promise<void>((resolve, reject) => {
            if (!existsSync(this.options.path)) {
                writeFileSync(this.options.path, '', 'utf-8')
            }

            open(this.options.path, 'r+', (err, fd) => {
                if (err) return reject(
                    err.stack
                )
                this.#descriptor = fd
                resolve()
            })
        })
    }

    /**
     * Gets the size of the file in bytes.
     * @returns 
     */
    size(): Promise<number> {
        return this.#file.size()
    }

    #throwIfNotReady(): this is BetterAoiDatabase<true> {
        if (!this.#ready) {
            throw new BetterAoiDatabaseError(
                BetterAoiDatabaseErrors.DATABASE_NOT_OPEN
            )
        }

        return true
    }

    connect(): Promise<BetterAoiDatabase<true>> {
        return new Promise(async (resolve, reject) => {
            await this.#open()

            await this.#file.createHeaders()
            await this.#file.fetchHeaders()

            await this.#fetchPages()

            this.#ready = true
            resolve(this)
        })
    }
}