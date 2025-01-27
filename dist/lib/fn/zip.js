import { head, isEmpty, tail } from "./utils.js";
/**
 * Applies a function to elements of multiple arrays in a zip-like fashion.
 *
 * @param fn - The function to apply.
 * @param xs - The arrays to zip.
 * @returns An array containing the results of applying `fn` to each set of elements from the input arrays.
 */
export const zipWith = (fn, ...xs) => xs.some(isEmpty)
    ? []
    : [fn(...xs.map(head)), ...zipWith(fn, ...xs.map(tail))];
//# sourceMappingURL=zip.js.map