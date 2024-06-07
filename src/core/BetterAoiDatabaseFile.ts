import { close, fstat, ftruncate, read, write } from "fs";
import readUInt32LE from "../functions/readUInt32LE";
import writeUInt32LE from "../functions/writeUInt32LE";
import { BetterAoiDatabaseError } from "../structures/BetterAoiDatabaseError";
import { Mutex } from "../structures/Mutex";
import { BetterAoiDatabaseErrors } from "../typings/enums/BetterAoiDatabaseErrors";
import { HeadersData } from "../typings/interfaces/HeadersData";
import { VerifiedPageData } from "../typings/interfaces/VerifiedPageData";
import { FileDescriptor } from "../typings/types/FileDescriptor";
import { If } from "../typings/types/If";
import { DefaultHeadersData } from "../util/constants/DefaultHeadersData";
import { BetterAoiDatabase } from "./BetterAoiDatabase";

export class BetterAoiDatabaseFile<K extends boolean = boolean> {
    #db: BetterAoiDatabase<K>
    #size = -1
    mutex = new Mutex()
    headers: HeadersData = DefaultHeadersData

    /**
     * The size of most of the stuff.
     */
    static MINIMUM_BYTES = 16

    /**
     * Headers size in the database.
     */
    static HEADER_SIZE = 128

    /**
     * The database name (current)
     */
    static DATABASE_NAME = "BETTER-AOIDB DATABASE"
    
    /**
     * The current database version, this will likely never change.
     */
    static DATABASE_VERSION = 1
    
    constructor(db: BetterAoiDatabase<K>) {
        this.#db = db
    }

    get descriptor() {
        return this.#db.descriptor
    }

    verifyPageData(bytes: Buffer, offset = 0): VerifiedPageData | null {
        const name = bytes.toString('utf-8', offset, offset + 4)
        const start = readUInt32LE(bytes, offset + 8)
        const index = readUInt32LE(bytes, offset + 4)
        const end = readUInt32LE(bytes, offset + 12)

        if (!isNaN(index) && name === 'PAGE' && start % BetterAoiDatabaseFile.MINIMUM_BYTES === 0 && end % BetterAoiDatabaseFile.MINIMUM_BYTES === 0) {
            return {
                start,
                index
            }
        }

        return null
    }

    /**
     * Reads and returns the entire file data skipping the headers.
     * @returns 
     */
    readAll(): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            this.readFromTo(BetterAoiDatabaseFile.HEADER_SIZE, await this.size())
                .then(resolve)
                .catch(reject)
        })
    }

    /**
     * Truncates this file to given size.
     * @param size The size to truncate the file to.
     */
    truncate(size: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this.mutex.lock()

            ftruncate(this.descriptor, size, (err) => {
                
                if (err) {
                    this.mutex.unlock()
                    return reject(err.stack)
                }

                this.#size = size
                
                this.mutex.unlock()
                resolve(true)
            })
        })
    }

    setRow(amount: number): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const alloc = Buffer.allocUnsafe(4)
            writeUInt32LE(alloc, amount)

            this.write(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4)
                .then(() => {
                    this.headers.rowCount = amount
                    resolve(true)
                })
                .catch(reject)
        })
    }

    /**
     * This will close the file and the descriptor will become unusable.
     */
    close(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this.mutex.lock()

            close(this.descriptor, (err) => {
                if (err) {
                    this.mutex.unlock()
                    return reject(err.stack)
                }

                this.mutex.unlock()
                resolve(true)
            })
        })
    }

    /**
     * The whole file will be cleared (beside headers), and row count will be set to 0.
     */
    clear(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            this.truncate(BetterAoiDatabaseFile.HEADER_SIZE)
                .then(() => {
                    this.setRow(0)
                        .then(() => {
                            this.setPageCount(0)
                                .then(resolve)
                                .catch(reject)
                        })
                        .catch(reject)
                })
                .catch(reject)
        })
    }

    /**
     * Gets the byte amount of this file.
     * @returns
     */
    async size(): Promise<number> {
        if (this.#size !== -1) return this.#size

        return new Promise((resolve, reject) => {
            fstat(this.descriptor, (err, stats) => {
                if (err) return reject(err.stack)
                this.#size = stats.size
                resolve(this.#size)
            })
        })
    }

    /**
     * Reads from a position the specified size.
     * @param position 
     * @param size 
     */
    read(position: number, size: number): Promise<Buffer> {
        return new Promise(async (resolve, reject) => {
            const alloc = Buffer.alloc(size)

            read(this.descriptor, alloc, 0, size, position, (err) => {
                if (err) return reject(err.stack)
                resolve(alloc)
            })
        })
    }

    subRow(amount = 1): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const alloc = Buffer.allocUnsafe(4)
            writeUInt32LE(alloc, this.headers.rowCount - amount)

            this.write(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4)
                .then(() => {
                    this.headers.rowCount -= amount
                    resolve(true)
                })
                .catch(reject)
        })
    }

    addRow(amount = 1): Promise<boolean> {
        return new Promise((resolve, reject) => {
            const alloc = Buffer.allocUnsafe(4)
            writeUInt32LE(alloc, this.headers.rowCount + amount)

            this.write(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4)
                .then(() => {
                    this.headers.rowCount += amount
                    resolve(true)
                })
                .catch(reject)
        })
    }

    write(bytes: Buffer, position?: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            await this.mutex.lock()

            if (!position) {
                position = await this.size()
            }

            write(this.descriptor, bytes, undefined, undefined, position, (err, bytes) => {
                if (err) {
                    this.mutex.unlock()
                    return reject(err.stack)
                }

                if (position === this.#size) {
                    this.#size += bytes
                } else if (position as number < this.#size) {
                    if (bytes + (position as number) > this.#size) {
                        this.#size += ((bytes + (position as number)) - this.#size)
                    }                    
                }

                this.mutex.unlock()
                resolve(true)
            })
        })
    } 

    createHeaders(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            if (!(await this.isNewFile())) {
                return resolve(false)
            }

            const alloc = Buffer.allocUnsafe(BetterAoiDatabaseFile.HEADER_SIZE)

            /**
             * The database name
             */
            alloc.write(
                BetterAoiDatabaseFile.DATABASE_NAME
            )

            /**
             * The database version.
             */
            writeUInt32LE(
                alloc,
                BetterAoiDatabaseFile.DATABASE_VERSION,
                BetterAoiDatabaseFile.DATABASE_NAME.length
            )

            /**
             * The row count.
             */
            writeUInt32LE(
                alloc,
                0,
                BetterAoiDatabaseFile.DATABASE_NAME.length + 4
            )

            /**
             * The page count.
             */
            writeUInt32LE(
                alloc,
                0,
                BetterAoiDatabaseFile.DATABASE_NAME.length + 8
            )

            this.write(alloc, 0)
                .then(resolve)
                .catch(reject)
        })
    }

    addPage(amount = 1) {
        return this.setPageCount(this.headers.pageCount + amount)
    }

    setPageCount(amount: number): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const buff = Buffer.allocUnsafe(4)
            writeUInt32LE(buff, amount)
            this.write(
                buff,
                BetterAoiDatabaseFile.DATABASE_NAME.length + 8
            )
            .then(() => {
                this.headers.pageCount = amount
                resolve(true)
            })
            .catch(reject)
        })
    }

    fetchHeaders(): Promise<this> {
        return new Promise(async (resolve, reject) => {
            const alloc = await this.read(0, BetterAoiDatabaseFile.HEADER_SIZE)

            const name = alloc.toString('utf-8', 0, BetterAoiDatabaseFile.DATABASE_NAME.length)

            if (name !== BetterAoiDatabaseFile.DATABASE_NAME) {
                return reject(
                    new BetterAoiDatabaseError(BetterAoiDatabaseErrors.CORRUPT_DATABASE_NAME, name)
                )
            }

            const version = readUInt32LE(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length)
            
            if (isNaN(version) || BetterAoiDatabaseFile.DATABASE_VERSION !== version) {
                return reject(
                    new BetterAoiDatabaseError(BetterAoiDatabaseErrors.CORRUPT_DATABASE_VERSION, version)
                )
            }

            const rows = readUInt32LE(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4)

            if (isNaN(rows)) {
                return reject(
                    new BetterAoiDatabaseError(BetterAoiDatabaseErrors.CORRUPT_ROW_COUNT, rows)
                )   
            }

            const pages = readUInt32LE(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 8)

            if (isNaN(pages)) {
                return reject(
                    new BetterAoiDatabaseError(BetterAoiDatabaseErrors.CORRUPT_PAGE_COUNT)
                )
            }

            this.headers = {
                version,
                name,
                rowCount: rows,
                pageCount: pages
            }

            resolve(this)
        })
    }

    isNewFile(): Promise<boolean> {
        return new Promise(async (resolve, reject) => {
            const size = await this.size()
            resolve(size === 0)
        })
    }

    readFromTo(from: number, to: number) {
        return this.read(from, to - from)
    }
}