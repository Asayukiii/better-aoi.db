import readUInt32LE from "../functions/readUInt32LE"
import writeUInt32LE from "../functions/writeUInt32LE"
import { EncodedData } from "../typings/interfaces/EncodedData"
import { DataResolvable } from "../typings/types/DataResolvable"

export class BetterAoiDatabaseEncoder {
    bufferSize: number

    static BUFFER_SIZE = 16_384

    private constructor(size: number) {
        this.bufferSize = size
    }

    /**
     * Creates a new instance of the encoder.
     * @returns 
     */
    static create() {
        return new BetterAoiDatabaseEncoder(this.BUFFER_SIZE)
    }

    /**
     * Encodes an array of data resolvables.
     * @param data The data to buffer.
     */
    encode(data: DataResolvable[]): EncodedData {
        const len = data.length
        let allocated = Buffer.allocUnsafe(Math.floor(len / 100 + 1) * this.bufferSize)
        const bytes: number[] = []
        let left = allocated.length;
        let pos = 0;

        for (let i = 0;i < len;i++) {
            const json = JSON.stringify(data[i])
            const len = json.length + 4;
            
            while (len > left) {
                allocated = BetterAoiDatabaseEncoder.expand(allocated)
                left += this.bufferSize
            }

            writeUInt32LE(allocated, len - 4, pos)
            allocated.write(json, pos + 4)

            left -= len
            bytes.push(len)
            pos += len
        }

        return {
            buffer: allocated = BetterAoiDatabaseEncoder.partition(allocated, pos),
            bytes
        }
    }

    /**
     * Breaks this buffer into the nearest multiple of 16.
     * @param buff The buffer to break.
     */
    static partition(buff: Buffer, size: number) {
        const left = 16 - size % 16 
        if (left === 16) {
            if (buff.length === size) return buff;
            return buff.slice(0, size)
        };
        return buff.slice(0, size + left)
    }

    /**
     * Expands a buffer by 16384 bytes.
     * @param buff The buffer to expand.
     * @returns The expanded buffer.
     */
    static expand(buff: Buffer): Buffer {
        return Buffer.concat(
            [
                buff,
                Buffer.allocUnsafe(this.BUFFER_SIZE)   
            ],
            buff.length + this.BUFFER_SIZE
        )
    }

    /**
     * Decodes a buffer into an array of data resolvables.
     * @param buffer The buffer to decode.
     * @returns
     */
    decode(buffer: Buffer): DataResolvable[] {
        const raw: string[] = []

        const len = buffer.length;
        let pos = 0;

        for (;;) {
            const size = readUInt32LE(buffer, pos)

            const utf8 = buffer.toString('utf-8', pos + 4, pos + 4 + size)

            if (utf8[0] !== '{') {
                break
            }

            raw.push(utf8)

            pos += 4 + size
        }

        return JSON.parse(`[${raw.join(',')}]`)
    }
}