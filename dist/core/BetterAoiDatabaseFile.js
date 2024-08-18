"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAoiDatabaseFile = void 0;
const fs_1 = require("fs");
const readUInt32LE_1 = __importDefault(require("../functions/readUInt32LE"));
const writeUInt32LE_1 = __importDefault(require("../functions/writeUInt32LE"));
const BetterAoiDatabaseError_1 = require("../structures/BetterAoiDatabaseError");
const Mutex_1 = require("../structures/Mutex");
const BetterAoiDatabaseErrors_1 = require("../typings/enums/BetterAoiDatabaseErrors");
const DefaultHeadersData_1 = require("../util/constants/DefaultHeadersData");
class BetterAoiDatabaseFile {
    #db;
    #size = -1;
    mutex = new Mutex_1.Mutex();
    headers = DefaultHeadersData_1.DefaultHeadersData;
    static MINIMUM_BYTES = 16;
    static HEADER_SIZE = 128;
    static DATABASE_NAME = "BETTER-AOIDB DATABASE";
    static DATABASE_VERSION = 1;
    constructor(db) {
        this.#db = db;
    }
    get descriptor() {
        return this.#db.descriptor;
    }
    verifyPageData(bytes, offset = 0) {
        const name = bytes.toString('utf-8', offset, offset + 4);
        const start = (0, readUInt32LE_1.default)(bytes, offset + 8);
        const index = (0, readUInt32LE_1.default)(bytes, offset + 4);
        const end = (0, readUInt32LE_1.default)(bytes, offset + 12);
        if (!isNaN(index) && name === 'PAGE' && start % BetterAoiDatabaseFile.MINIMUM_BYTES === 0 && end % BetterAoiDatabaseFile.MINIMUM_BYTES === 0) {
            return {
                start,
                index
            };
        }
        return null;
    }
    readAll() {
        return new Promise(async (resolve, reject) => {
            this.readFromTo(BetterAoiDatabaseFile.HEADER_SIZE, await this.size())
                .then(resolve)
                .catch(reject);
        });
    }
    truncate(size) {
        return new Promise(async (resolve, reject) => {
            await this.mutex.lock();
            (0, fs_1.ftruncate)(this.descriptor, size, (err) => {
                if (err) {
                    this.mutex.unlock();
                    return reject(err.stack);
                }
                this.#size = size;
                this.mutex.unlock();
                resolve(true);
            });
        });
    }
    setRow(amount) {
        return new Promise((resolve, reject) => {
            const alloc = Buffer.allocUnsafe(4);
            (0, writeUInt32LE_1.default)(alloc, amount);
            this.write(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4)
                .then(() => {
                this.headers.rowCount = amount;
                resolve(true);
            })
                .catch(reject);
        });
    }
    close() {
        return new Promise(async (resolve, reject) => {
            await this.mutex.lock();
            (0, fs_1.close)(this.descriptor, (err) => {
                if (err) {
                    this.mutex.unlock();
                    return reject(err.stack);
                }
                this.mutex.unlock();
                resolve(true);
            });
        });
    }
    clear() {
        return new Promise(async (resolve, reject) => {
            this.truncate(BetterAoiDatabaseFile.HEADER_SIZE)
                .then(() => {
                this.setRow(0)
                    .then(() => {
                    this.setPageCount(0)
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            })
                .catch(reject);
        });
    }
    async size() {
        if (this.#size !== -1)
            return this.#size;
        return new Promise((resolve, reject) => {
            (0, fs_1.fstat)(this.descriptor, (err, stats) => {
                if (err)
                    return reject(err.stack);
                this.#size = stats.size;
                resolve(this.#size);
            });
        });
    }
    read(position, size) {
        return new Promise(async (resolve, reject) => {
            const alloc = Buffer.alloc(size);
            (0, fs_1.read)(this.descriptor, alloc, 0, size, position, (err) => {
                if (err)
                    return reject(err.stack);
                resolve(alloc);
            });
        });
    }
    subRow(amount = 1) {
        return new Promise((resolve, reject) => {
            const alloc = Buffer.allocUnsafe(4);
            (0, writeUInt32LE_1.default)(alloc, this.headers.rowCount - amount);
            this.write(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4)
                .then(() => {
                this.headers.rowCount -= amount;
                resolve(true);
            })
                .catch(reject);
        });
    }
    addRow(amount = 1) {
        return new Promise((resolve, reject) => {
            const alloc = Buffer.allocUnsafe(4);
            (0, writeUInt32LE_1.default)(alloc, this.headers.rowCount + amount);
            this.write(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4)
                .then(() => {
                this.headers.rowCount += amount;
                resolve(true);
            })
                .catch(reject);
        });
    }
    write(bytes, position) {
        return new Promise(async (resolve, reject) => {
            await this.mutex.lock();
            if (!position) {
                position = await this.size();
            }
            (0, fs_1.write)(this.descriptor, bytes, undefined, undefined, position, (err, bytes) => {
                if (err) {
                    this.mutex.unlock();
                    return reject(err.stack);
                }
                if (position === this.#size) {
                    this.#size += bytes;
                }
                else if (position < this.#size) {
                    if (bytes + position > this.#size) {
                        this.#size += ((bytes + position) - this.#size);
                    }
                }
                this.mutex.unlock();
                resolve(true);
            });
        });
    }
    createHeaders() {
        return new Promise(async (resolve, reject) => {
            if (!(await this.isNewFile())) {
                return resolve(false);
            }
            const alloc = Buffer.allocUnsafe(BetterAoiDatabaseFile.HEADER_SIZE);
            alloc.write(BetterAoiDatabaseFile.DATABASE_NAME);
            (0, writeUInt32LE_1.default)(alloc, BetterAoiDatabaseFile.DATABASE_VERSION, BetterAoiDatabaseFile.DATABASE_NAME.length);
            (0, writeUInt32LE_1.default)(alloc, 0, BetterAoiDatabaseFile.DATABASE_NAME.length + 4);
            (0, writeUInt32LE_1.default)(alloc, 0, BetterAoiDatabaseFile.DATABASE_NAME.length + 8);
            this.write(alloc, 0)
                .then(resolve)
                .catch(reject);
        });
    }
    addPage(amount = 1) {
        return this.setPageCount(this.headers.pageCount + amount);
    }
    setPageCount(amount) {
        return new Promise(async (resolve, reject) => {
            const buff = Buffer.allocUnsafe(4);
            (0, writeUInt32LE_1.default)(buff, amount);
            this.write(buff, BetterAoiDatabaseFile.DATABASE_NAME.length + 8)
                .then(() => {
                this.headers.pageCount = amount;
                resolve(true);
            })
                .catch(reject);
        });
    }
    fetchHeaders() {
        return new Promise(async (resolve, reject) => {
            const alloc = await this.read(0, BetterAoiDatabaseFile.HEADER_SIZE);
            const name = alloc.toString('utf-8', 0, BetterAoiDatabaseFile.DATABASE_NAME.length);
            if (name !== BetterAoiDatabaseFile.DATABASE_NAME) {
                return reject(new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.CORRUPT_DATABASE_NAME, name));
            }
            const version = (0, readUInt32LE_1.default)(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length);
            if (isNaN(version) || BetterAoiDatabaseFile.DATABASE_VERSION !== version) {
                return reject(new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.CORRUPT_DATABASE_VERSION, version));
            }
            const rows = (0, readUInt32LE_1.default)(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 4);
            if (isNaN(rows)) {
                return reject(new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.CORRUPT_ROW_COUNT, rows));
            }
            const pages = (0, readUInt32LE_1.default)(alloc, BetterAoiDatabaseFile.DATABASE_NAME.length + 8);
            if (isNaN(pages)) {
                return reject(new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.CORRUPT_PAGE_COUNT));
            }
            this.headers = {
                version,
                name,
                rowCount: rows,
                pageCount: pages
            };
            resolve(this);
        });
    }
    isNewFile() {
        return new Promise(async (resolve, reject) => {
            const size = await this.size();
            resolve(size === 0);
        });
    }
    readFromTo(from, to) {
        return this.read(from, to - from);
    }
}
exports.BetterAoiDatabaseFile = BetterAoiDatabaseFile;
//# sourceMappingURL=BetterAoiDatabaseFile.js.map