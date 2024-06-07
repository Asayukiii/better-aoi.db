/**
 * Transforms a string into a hash.
 * @param key The string to transform.
 * @returns
 */
export default function getBetterAoiCode(key: string): number {
    let hash = 0;
    const len = key.length;
    for (let i = 0; i < len; i++) {
        const code = key.charCodeAt(i);
        hash = ((hash << 5) - hash) + code;
    }

    return hash >>> 0;
}