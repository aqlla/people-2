import { Take } from "../types";

/**
 * Extracts the first `N` elements from an array at runtime.
 *
 * @param arr - The array from which to take elements.
 * @param end - The number of elements to take.
 * @returns A new array containing only the first `N` elements.
 */
export const take = <T extends readonly any[], N extends number>(arr: readonly [...T], end: N) =>
    arr.slice(0, end) as readonly any[] as Take<T, N>

/**
 * Determines the length of a readonly array.
 *
 * @param collection - The array to measure.
 * @returns The length of the array.
 */
export const len = <T extends any>(collection: ReadonlyArray<T>): number => collection.length

/**
 * Checks if an array is empty.
 *
 * @param collection - The array to check.
 * @returns True if the array is empty, false otherwise.
 */
export const isEmpty = <T extends any>(collection: Array<T>): boolean => len(collection) === 0

/**
 * Retrieves the first element of a readonly array.
 *
 * @param collection - The array from which to get the first element.
 * @returns The first element of the array.
 */
export const head = <T extends unknown>(collection: ReadonlyArray<T>): T => collection[0]

/**
 * Retrieves all but the first element of a readonly array.
 *
 * @param collection - The array from which to get the tail elements.
 * @returns A new array containing all elements except the first.
 */
export const tail = <T extends unknown>(collection: ReadonlyArray<T>): Array<T> => collection.slice(1)

/**
 * Determines if all elements in an array are the same.
 *
 * @param xs - The array to check.
 * @returns True if all elements are the same, false otherwise.
 */
export const allSame = (xs: any[]): boolean => {
    switch (xs.length) {
        case 0: return false;
        case 1: return true;
        default:
            const first = xs[0];
            for (let i = 1; i < xs.length; i++)
                if (xs[i] !== first) return false;
            return true;
    }
};