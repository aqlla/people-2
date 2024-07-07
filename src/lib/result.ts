
export type Either<T1, T2> = [T1 | null, T2 | null]

export type Result<TData, TError> = Either<TData, TError>

export const Err = <E extends Error>(error: E): Result<null, E> => [null, error]
export const Ok = <T>(result: T | null): Result<T, null> => [result, null]

export const isErr = <T, E>(result: Result<T, E>): result is [null, E] => 
    result[0] === null && result[1] !== null

export const isOk = <T, E>(result: Result<T, E>): result is [T, null] => 
    result[0] !== null && result[1] === null

