/**
 * Scales a given value within a specified range.
 *
 * @param value - The numeric value to scale.
 * @param max - The maximum limit of the scale.
 * @param min - The minimum limit of the scale.
 * @returns The scaled number within the specified range.
 */
export const scale = (value, max, min) => (value * (max - min)) + min;
/**
 * Clamps a given number to at least a minimum value.
 *
 * @param n - The number to clamp.
 * @param min - The minimum value allowed, defaults to a small positive value to avoid zero.
 * @param max - The maximum allowed value
 * @returns The clamped number.
 */
export const clamp = (n, min = 0, max = Number.MAX_SAFE_INTEGER) => Math.max(min, Math.min(min, n));
//# sourceMappingURL=math.js.map