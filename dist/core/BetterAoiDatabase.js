"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.BetterAoiDatabase = void 0;
const fs_1 = require("fs");
const createBinary_1 = __importDefault(require("../functions/createBinary"));
const decodeBinary_1 = __importDefault(require("../functions/decodeBinary"));
const getBetterAoiCode_1 = __importDefault(require("../functions/getBetterAoiCode"));
const isEmpty_1 = __importDefault(require("../functions/isEmpty"));
const readUInt32LE_1 = __importDefault(require("../functions/readUInt32LE"));
const writeUInt32LE_1 = __importDefault(require("../functions/writeUInt32LE"));
const BetterAoiDatabaseError_1 = require("../structures/BetterAoiDatabaseError");
const BetterAoiDatabasePage_1 = require("../structures/BetterAoiDatabasePage");
const BetterAoiDatabasePageManager_1 = require("../structures/BetterAoiDatabasePageManager");
const BetterAoiDatabaseErrors_1 = require("../typings/enums/BetterAoiDatabaseErrors");
const DefaultBetterAoiDatabaseOptions_1 = require("../util/constants/DefaultBetterAoiDatabaseOptions");
const ValidateDatabaseConnection_1 = __importDefault(require("../util/decorators/ValidateDatabaseConnection"));
const Util_1 = require("../util/Util");
const BetterAoiDatabaseEncoder_1 = require("./BetterAoiDatabaseEncoder");
const BetterAoiDatabaseFile_1 = require("./BetterAoiDatabaseFile");
class BetterAoiDatabase {
    options;
    #encoder = BetterAoiDatabaseEncoder_1.BetterAoiDatabaseEncoder.create();
    #descriptor = -1;
    #ready = false;
    pages = new BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager(this);
    #file = new BetterAoiDatabaseFile_1.BetterAoiDatabaseFile(this);
    constructor(options = DefaultBetterAoiDatabaseOptions_1.DefaultBetterAoiDatabaseOptions) {
        this.options = Util_1.Util.mergeDefault(options, DefaultBetterAoiDatabaseOptions_1.DefaultBetterAoiDatabaseOptions);
        this.#validateOptions();
    }
    get descriptor() {
        return this.#descriptor;
    }
    get file() {
        return this.#file;
    }
    isReady() {
        return this.#ready;
    }
    async #fetchPages() {
        const alloc = await this.#file.readAll();
        let pos = 0;
        let len = alloc.length;
        for (; pos < len;) {
            const data = this.#file.verifyPageData(alloc, pos);
            pos += BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES;
            if (!data) {
                continue;
            }
            this.pages.add({
                start: data.start + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES,
                index: data.index
            });
        }
        if (this.pages.cache.size !== this.#file.headers.pageCount) {
            throw new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.DATABASE_CORRUPT_FILE);
        }
    }
    createPage(page) {
        return new Promise((resolve, reject) => {
            const data = Buffer.concat([
                page.headers,
                Buffer.alloc(BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE)
            ], BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES);
            this.#file.write(data)
                .then(() => {
                this.#file.addPage()
                    .then(() => {
                    this.pages.cache.set(page.id, page);
                    resolve(true);
                })
                    .catch(reject);
            })
                .catch(reject);
        });
    }
    #validateOptions() {
        if ((0, fs_1.existsSync)(this.options.path) && !(0, fs_1.statSync)(this.options.path).isFile()) {
            throw new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.PATH_NOT_A_FILE);
        }
    }
    getTotalRowCount() {
        return this.#file.headers.rowCount;
    }
    close() {
        return this.#file.close()
            .then(() => {
            this.#descriptor = -1;
            this.#ready = false;
            return true;
        });
    }
    clear() {
        return this.#file.clear()
            .then(() => {
            this.pages.cache.clear();
            return true;
        });
    }
    has(key) {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = typeof key === 'number' ? key : (0, getBetterAoiCode_1.default)(key);
            const p = this.pages.pageForBetterAoi(BetterAoi);
            if (!p)
                return resolve(false);
            const pos = p.positionWithOffset(BetterAoi);
            const alloc = await this.#file.read(pos, 4);
            if ((0, isEmpty_1.default)(alloc)) {
                return resolve(false);
            }
            resolve(true);
        });
    }
    get(key) {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = (0, getBetterAoiCode_1.default)(key);
            const p = this.pages.pageForBetterAoi(BetterAoi);
            if (!p) {
                return resolve(null);
            }
            const pos = p.positionWithOffset(BetterAoi);
            const alloc = await this.#file.read(pos, 4);
            if ((0, isEmpty_1.default)(alloc)) {
                return resolve(null);
            }
            const bin = (0, decodeBinary_1.default)(alloc);
            const size = await this.#file.read(bin.start, 4);
            const data = await this.#file.read(bin.start + 4, (0, readUInt32LE_1.default)(size));
            resolve(JSON.parse(data.toString('utf-8')));
        });
    }
    insertMany(datas) {
        return new Promise(async (resolve, reject) => {
            const BetterAoies = [];
            const len = datas.length;
            const pages = new Set();
            const writer = new Map();
            const values = [];
            for (let i = 0; i < len; i++) {
                values.push(datas[i].value);
            }
            const encoded = this.#encoder.encode(values);
            for (let i = 0; i < len; i++) {
                const { key, value } = datas[i];
                const BetterAoi = (0, getBetterAoiCode_1.default)(key);
                const id = this.pages.pageIDForBetterAoi(BetterAoi);
                if (!writer.has(id))
                    writer.set(id, []);
                writer.get(id)?.push({ BetterAoi, size: encoded.bytes[i] });
                const page = this.pages.pageForBetterAoi(BetterAoi);
                if (pages.has(id)) {
                    BetterAoies.push(BetterAoi);
                    continue;
                }
                if (await this.has(BetterAoi)) {
                    return reject(new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.UNIQUE_CONSTRAINT_FAILED, key));
                }
                BetterAoies.push(BetterAoi);
                if (!page)
                    pages.add(id);
            }
            const size = pages.size;
            let currentSize = await this.#file.size();
            if (size) {
                const pageAlloc = Buffer.alloc(size * (BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES));
                let s = 0;
                const entries = [...pages.values()];
                for (let i = 0; i < size; i++) {
                    const page = this.pages.add({ start: currentSize + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES, index: entries[i] });
                    pageAlloc.write('PAGE', s);
                    (0, writeUInt32LE_1.default)(pageAlloc, page.id, s + 4);
                    (0, writeUInt32LE_1.default)(pageAlloc, page.start - BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES, s + 8);
                    (0, writeUInt32LE_1.default)(pageAlloc, page.end, s + 12);
                    s += BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES;
                    currentSize += BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES;
                }
                await this.#file.write(pageAlloc);
                await this.#file.addPage(size);
            }
            const ids = [...writer.keys()];
            const len1 = ids.length;
            for (let x = 0; x < len1; x++) {
                const id = ids[x];
                const value = writer.get(id);
                const page = this.pages.cache.get(id);
                const len = value.length;
                const alloc = Buffer.alloc(BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE);
                await this.pages.readTo(id, alloc);
                for (let i = 0; i < len; i++) {
                    const { BetterAoi, size } = value[i];
                    const pos = page.position(BetterAoi);
                    (0, writeUInt32LE_1.default)(alloc, currentSize, pos);
                    currentSize += size;
                }
                await this.#file.write(alloc, page.start);
            }
            await this.#file.addRow(len);
            await this.#file.write(encoded.buffer)
                .then(() => resolve())
                .catch(reject);
        });
    }
    insertUnsafe(key, data) {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = (0, getBetterAoiCode_1.default)(key);
            const id = this.pages.pageIDForBetterAoi(BetterAoi);
            const page = this.pages.pageForBetterAoi(BetterAoi) ?? await this.createPage(new BetterAoiDatabasePage_1.BetterAoiDatabasePage({
                index: id,
                start: await this.#file.size() + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES
            })).then(c => this.pages.cache.get(id));
            const pos = page.positionWithOffset(BetterAoi);
            const encoded = this.#encoder.encode([data]);
            const alloc = encoded.buffer;
            const size = await this.#file.size();
            const bin = (0, createBinary_1.default)(size);
            this.#file.write(bin, pos).then(async () => {
                await this.#file.addRow();
                this.file.write(alloc)
                    .then(() => resolve())
                    .catch(reject);
            })
                .catch(reject);
        });
    }
    insert(key, data) {
        return new Promise(async (resolve, reject) => {
            if (await this.has(key)) {
                return reject(new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.UNIQUE_CONSTRAINT_FAILED, key));
            }
            const BetterAoi = (0, getBetterAoiCode_1.default)(key);
            const id = this.pages.pageIDForBetterAoi(BetterAoi);
            const page = this.pages.pageForBetterAoi(BetterAoi) ?? await this.createPage(new BetterAoiDatabasePage_1.BetterAoiDatabasePage({
                index: id,
                start: await this.#file.size() + BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.MINIMUM_BYTES
            })).then(c => this.pages.cache.get(id));
            const pos = page.positionWithOffset(BetterAoi);
            const encoded = this.#encoder.encode([data]);
            const alloc = encoded.buffer;
            const size = await this.#file.size();
            const bin = (0, createBinary_1.default)(size);
            this.#file.write(bin, pos).then(async () => {
                await this.#file.addRow();
                this.file.write(alloc)
                    .then(() => resolve())
                    .catch(reject);
            })
                .catch(reject);
        });
    }
    delete(key) {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = (0, getBetterAoiCode_1.default)(key);
            const page = this.pages.pageForBetterAoi(BetterAoi);
            if (!page)
                return resolve(false);
            const pos = page.positionWithOffset(BetterAoi);
            this.#file.write(Buffer.alloc(4), pos)
                .then(resolve)
                .catch(reject);
        });
    }
    all() {
        return new Promise(async (resolve, reject) => {
            const alloc = await this.#file.read(0, await this.#file.size());
            const pages = [...this.pages.cache.keys()];
            const current = Buffer.allocUnsafe(alloc.length - BetterAoiDatabaseFile_1.BetterAoiDatabaseFile.HEADER_SIZE - (pages.length * BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE));
            let buffpos = 0;
            for (let i = 0, len = pages.length; i < len; i++) {
                const page = this.pages.cache.get(pages[i]);
                const part = alloc.slice(page.start, page.end);
                for (let pos = 0; pos !== BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_PAGE_SIZE; pos += BetterAoiDatabasePageManager_1.BetterAoiDatabasePageManager.BetterAoi_SIZE) {
                    const start = (0, readUInt32LE_1.default)(part, pos);
                    if (start === 0) {
                        continue;
                    }
                    const size = (0, readUInt32LE_1.default)(alloc, start);
                    (0, writeUInt32LE_1.default)(current, size, buffpos);
                    current.write(alloc.toString('utf-8', start + 4, start + 4 + size), buffpos + 4);
                    buffpos += size + 4;
                }
            }
            resolve(this.#encoder.decode(current));
        });
    }
    update(key, value) {
        return new Promise(async (resolve, reject) => {
            const BetterAoi = (0, getBetterAoiCode_1.default)(key);
            const page = this.pages.pageForBetterAoi(BetterAoi);
            if (!page)
                return resolve(false);
            const pos = page.positionWithOffset(BetterAoi);
            const dataPos = await this.#file.read(pos, 4);
            const r = (0, readUInt32LE_1.default)(dataPos);
            if (r === 0)
                return resolve(false);
            const isize = await this.#file.read(r, 4);
            const size = (0, readUInt32LE_1.default)(isize);
            const encoded = this.#encoder.encode([value]);
            const bytes = encoded.bytes[0] - 4;
            const alloc = encoded.buffer;
            if (bytes > size) {
                const datapos = await this.#file.size();
                await this.#file.write(alloc, datapos)
                    .then(() => {
                    const buff = (0, createBinary_1.default)(datapos);
                    this.#file.write(buff, pos)
                        .then(resolve)
                        .catch(reject);
                })
                    .catch(reject);
            }
            else {
                await this.#file.write(alloc, r)
                    .then(resolve)
                    .catch(reject);
            }
        });
    }
    #open() {
        return new Promise((resolve, reject) => {
            if (!(0, fs_1.existsSync)(this.options.path)) {
                (0, fs_1.writeFileSync)(this.options.path, '', 'utf-8');
            }
            (0, fs_1.open)(this.options.path, 'r+', (err, fd) => {
                if (err)
                    return reject(err.stack);
                this.#descriptor = fd;
                resolve();
            });
        });
    }
    size() {
        return this.#file.size();
    }
    #throwIfNotReady() {
        if (!this.#ready) {
            throw new BetterAoiDatabaseError_1.BetterAoiDatabaseError(BetterAoiDatabaseErrors_1.BetterAoiDatabaseErrors.DATABASE_NOT_OPEN);
        }
        return true;
    }
    connect() {
        return new Promise(async (resolve, reject) => {
            await this.#open();
            await this.#file.createHeaders();
            await this.#file.fetchHeaders();
            await this.#fetchPages();
            this.#ready = true;
            resolve(this);
        });
    }
}
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "getTotalRowCount", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "close", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "clear", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "has", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "get", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "insertMany", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "insertUnsafe", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "insert", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "delete", null);
__decorate([
    ValidateDatabaseConnection_1.default
], BetterAoiDatabase.prototype, "update", null);
exports.BetterAoiDatabase = BetterAoiDatabase;
//# sourceMappingURL=BetterAoiDatabase.js.map