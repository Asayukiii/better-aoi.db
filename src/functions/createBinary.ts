import writeUInt32LE from "./writeUInt32LE"

export default function (start: number) {
    const alloc = Buffer.allocUnsafe(4)
    writeUInt32LE(alloc, start)
    return alloc
} 