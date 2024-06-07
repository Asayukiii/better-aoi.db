/**
 * The options of a page.
 * Due to the file always being a multiple of 16, we do not have to cache more data.
 */
export interface DatabasePageOptions {
    /**
     * This is the index (based on the hashes) of the page.
     */
    index: number

    /**
     * The start in bytes of this page in the file.
     */
    start: number
}