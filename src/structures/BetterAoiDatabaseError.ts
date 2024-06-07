export class BetterAoiDatabaseError extends Error {
    constructor(err: string, ...params: unknown[]) {
        super(
            BetterAoiDatabaseError.#make(err, ...params)
        )
    }

    static #make(
        err: string,
        ...params: unknown[]
    ) {
        params.map((x, y) => err = err.replaceAll(`$${y+1}`, `${x}`))
        return err
    }
}