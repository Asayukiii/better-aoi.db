export default function (data: Buffer): boolean {
    const len = data.length
    for (let i = 0; i < len; i++) {
        if (data[i] !== 0) return false
    }
    return true
}