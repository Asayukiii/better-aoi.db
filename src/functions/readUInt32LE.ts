/**
 * Reads an unsigned int 32.
 * @param buff The buffer to read this unsigned int on.
 * @param offset The offset for this unsigned int.
 * @returns
 */
export default function (buff: Buffer, offset: number = 0) {
    return buff[offset] +
        buff[offset + 1] * 2 ** 8 +
        buff[offset + 2] * 2 ** 16 +
        buff[offset + 3] * 2 ** 24;
}