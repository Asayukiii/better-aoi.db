/**
 * Data returned by BetterAoiDatabaseEncoder#encode.
 */
export interface EncodedData {
    /**
     * The bytes per each element.
     */
    bytes: number[]

    /**
     * The buffer will always be a multiple of 16.
     */
    buffer: Buffer
}