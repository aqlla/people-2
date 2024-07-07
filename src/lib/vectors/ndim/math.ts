import { Tuple } from "../../types.js";
import { zipWith } from "../../fn/zip.js"
import { Dim, NVec, NVecLike } from "./types.js";


/**
 * Map components with a function
 */
export const map = <NDim extends Dim>(fn, vector: NVec<NDim>): Tuple<NDim> => {
    return vector.map(fn) as Tuple<NDim>
}


/**
 * Vector Addition. 
 * 
 * Calculates the sum of two vectors of N dimensions. Utilizes the `zipWith`
 * function to find the sum of each vector component. 
 * 
 * 
 * @typeParam {number} NDim the dimensionality of the vectors.
 * 
 * @param augend the first vector, the augend.
 * @param addend the second vector, the addend.
 * @returns sum of the provided vectors.
 */
export const add = <NDim extends Dim>(augend: NVec<NDim>, addend: NVec<NDim>): Tuple<NDim> =>
    zipWith((a, b) => a + b, augend, addend) as Tuple<NDim>

/**
 * Subtraction. Calculates the difference between two vectors of N dimensions.
 * 
 * @param minuend the vector to subtract from.
 * @param subtrahend the vector to subtract from the minuend.
 * @returns the vector difference between the minuend and subtrahend.
 */
export const sub = <NDim extends Dim>(minuend: NVec<NDim>, subtrahend: NVec<NDim> | Array<number>): Tuple<NDim> =>
    zipWith((a, b) => a - b, minuend, subtrahend) as Tuple<NDim>

/**
 * Calculates the product of an N-dimensional vector and a scalar.
 * 
 * @param vector the vector-valued multiplicand.
 * @param scalar the scalar-valued multiplier.
 * @returns the product of the vector multiplicand and the scalar multiplier. 
 */
export const mul = <NDim extends Dim>(vector: NVec<NDim>, scalar: number): Tuple<NDim> =>
    vector.map(component => component * scalar) as Tuple<NDim>

/**
 * Calculates the quotiend of an N-dimensional vector and a scalar.
 * 
 * @param vector the vactor-valued dividend.
 * @param scalar the scalar-valued divisor.
 * @returns the quotient of a vector dividend and a scalar divisor.
 */
export const div = <NDim extends Dim>(vector: NVec<NDim>, scalar: number): Tuple<NDim> => {
    if (scalar === 0) {
        console.error("Div by 0")
        console.log(vector)
    }
    return vector.map(component => component / scalar) as Tuple<NDim>
}

/**
 * Calculates the dot product of two N-dimensional vectors.
 * 
 * @returns the dot product of N-Dim vectors l and r.
 */
export const dot = <NDim extends Dim>(l: NVec<NDim>, r: NVec<NDim>): number =>
    l.reduce((acc, curr, index) => acc + curr * r[index], 0)

/**
 * Calculates the squared magnitude of an n-dimensional vector.
 * 
 * @param vector the vector whose squared magnitude will be found.
 * @returns the square of the magnitude of the provided N-Dimensional vector.
 */
export const magnitudeSquared = <NDim extends Dim>(vector: NVec<NDim>): number =>
    vector.reduce((acc, val) => acc + val * val, 0)

/**
 * Calculates the magnitude of an n-dimensional vector.
 * 
 * @param vector the vector whose magnitude will be found.
 * @returns the magnitude of the provided N-Dimensional vector.
 */
export const magnitude = <NDim extends Dim>(vector: NVec<NDim>): number =>
    Math.sqrt(magnitudeSquared(vector))

/**
 * Calculates the unit vector of an n-dimensional vector.
 * 
 * @param vector the vector to calclulate the unit vector from.
 * @returns the unit vector of the given n-dimensional vector.
 */
export const unit = <NDim extends Dim>(vector: NVec<NDim>): Tuple<NDim> => {
    const mag = magnitude(vector)
    return vector.map(val => val / mag) as Tuple<NDim>
}

/**
 * Calculates the angle between 2 n-dimensional vectors.
 * 
 * @param l one of the vectors
 * @param r the other one of the vectors
 * @returns the angle between the 2 provided n-dimensional vectors.
 */
export const angle = <NDim extends Dim>(l: NVec<NDim>, r: NVec<NDim>): number =>
    Math.acos(dot(l, r) / (magnitude(l) * magnitude(r)))

/**
 * Calculates the midpoint of 2 n-dimensional vectors.
 * 
 * @param l one of the vectors
 * @param r the other one of the vectors
 * @returns the midpoint of the 2 provided n-dimensional vectors.
 */
export const midpoint = <NDim extends Dim>(l: NVec<NDim>, r: NVec<NDim>): Tuple<NDim> =>
    zipWith((a, b) => (a + b) / 2, l, r) as Tuple<NDim>

