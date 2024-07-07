
/**
 * Throws an error with a given message. Used for exceptional cases where normal execution cannot continue.
 *
 * @param msg - The error message.
 * @returns never
 * @throws {Error} Throws an error with the provided message.
 */
export const raise = (msg: string): never => {
    throw new Error(msg);
};

export const toFixed = (precision: number = 3) => 
    (n: Number) => n.toFixed(precision)

