
// Placeholder type for unimplemented features or temporary typing.
export type TODO = any;

/**
 * Defines a tuple of a fixed length.
 *
 * @typeParam Length - The exact length of the tuple.
 * @typeParam TItem - The type of items in the tuple, defaults to number.
 */
export type Tuple<Length extends number, TItem = number> =
    [TItem, ...TItem[]] & { readonly length: Length }

/**
 * Extracts the element type from an array or tuple.
 *
 * @typeParam T - The array or tuple to infer the element type from.
 */
export type ElementType<T extends Array<any>> = 
    T extends (infer U)[] | readonly (infer U)[] ? U : never

/**
 * Represents the length of a tuple.
 *
 * @typeParam T - The tuple to determine the length of.
 */
export type Length<T extends any[]> =
    T extends { length: infer L } ? L : never

/**
 * Constructs a tuple of a specific length.
 *
 * @typeParam L - The length of the tuple to construct.
 * @typeParam T - Accumulator for recursive construction, defaults to an empty tuple.
 */
export type BuildTuple<L extends number, T extends any[] = []> =
    T extends { length: L } ? T : BuildTuple<L, [...T, any]>

/**
 * Adds two compile-time numbers.
 *
 * @typeParam A - The first number.
 * @typeParam B - The second number.
 */
export type Add<A extends number, B extends number> =
    Length<[...BuildTuple<A>, ...BuildTuple<B>]>

/**
 * Subtracts one compile-time number from another.
 *
 * @typeParam A - The number to subtract from.
 * @typeParam B - The number to subtract.
 */
export type Subtract<A extends number, B extends number> =
    BuildTuple<A> extends [...(infer U), ...BuildTuple<B>] ? Length<U> : never

/**
 * Splits an array or tuple into two parts at a specified index.
 *
 * @typeParam Source - The array or tuple to split.
 * @typeParam N - The index at which to split.
 * @typeParam Accumulator - An internal accumulator for recursion; defaults to an empty tuple.
 * @returns A tuple where the first element is the first N elements of the source, and the second element is the remainder.
 */
export type Split<Source, N extends number, Accumulator extends readonly any[] = readonly []> =
    Accumulator['length'] extends N 
        ? [Accumulator, Source] 
        : Source extends readonly [infer First, ...infer Rest] 
            ? Split<readonly [...Rest], N, readonly [...Accumulator, First]> 
            : [Accumulator, Source]

/**
 * Extracts the first `N` elements from an array or tuple.
 *
 * @typeParam T - The source array or tuple type.
 * @typeParam N - The number of elements to extract.
 */
export type Take<T extends readonly any[], N extends number> = Split<T, N>[0]

/**
 * Drops the first `N` elements from an array or tuple.
 *
 * @typeParam T - The source array or tuple type.
 * @typeParam N - The number of elements to drop.
 */
export type Drop<T extends readonly any[], N extends number> = Split<T, N>[1];

/**
 * Represents an object that can be configured with a set of options.
 */
export interface Configurable {
    readonly config: { [key: string]: unknown };
}

export type Equatable = {
    eq(other: Equatable): boolean
}

/**
 * Describes an object that has a unique identifier and can be compared for equality.
 *
 * @typeParam T - The type of the identifier.
 */
export type Identafiable<T> = Equatable & {
    readonly id: T;
    eq(other: Identafiable<T>): boolean;
}

/**
 * Specialization of `Identafiable` for serially numbered identifiers.
 */
export type SerialIdentifiable = Identafiable<number>

export type Nameable = {
    name: string
}