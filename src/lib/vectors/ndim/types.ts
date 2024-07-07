import { Take, Tuple } from "../../types.js"
import { NDimVector } from "./nvector.js";

const DimensionsArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11] as const

export const DimensionsO = {
    1: 1,
    2: 2,
    3: 3,
    4: 4,
    5: 5,
    6: 6,
    7: 7,
    8: 8,
    9: 9,
    10: 10,
    11: 11,
} as const


export type Dimensions = typeof DimensionsArr

export type Dim = typeof DimensionsArr[number]

export type Dims<NDim extends Dim> = Take<typeof DimensionsArr, NDim>[number]

/**
 * A Coordinate Vector.
 * 
 * Domain-specific alias for an N-length Tuple<number>. Meant to serve as a
 * generic coordinate vector representation for use in mathmatics of all
 * varieties. Goes great with the position, velocity, acceleration, etc. of
 * kineric bodies (yes, even jerk, if you're into that kind of thing).
 * 
 * @typeParam NDim - literal integer type, only goes up to 11 though.
 */
export type NVec<NDim extends Dim> = Tuple<NDim, number> | Array<number>

/**
 * Looser alias for an N-dimensional coordinate vector, making it easier to
 * interface with the "real" world of javascript where everything is made-up
 * and types aren't real.
 */
export type NVecLike<NDim extends Dim> = NVec<NDim> | Array<number> | NDimVector<NDim>