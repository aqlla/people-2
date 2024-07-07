import { Take, Tuple } from "../../types.js"
import { add, angle, div, dot, magnitude, magnitudeSquared, map, midpoint, mul, sub, unit } from "./math.js"
import { Dim, NVec } from "./types.js"

const VectorComponentLabels = ["x", "y", "z", "w"] as const

type NDimVectorComponentLabels<N extends Dim> =
    Take<typeof VectorComponentLabels, N>

/**
 * Maps the labels for an N-dimensional vector's components to numeric values, creating a readonly structure.
 * 
 * @typeParam N - The dimension of the vector, which dictates the component labels used.
 * @returns A readonly record mapping each component label to a number.
 */
type NDimVectorComponents<N extends Dim> = 
    Record<NDimVectorComponentLabels<N>[number], number>;
    


/**
 * Represents an N-dimensional vector with type-safe component management.
 * Allows for the creation and manipulation of vectors with a predefined number of dimensions.
 * 
 * @typeParam NDim - The dimension of the vector.
 */
export class NDimVector<NDim extends Dim> {
    public components: Tuple<NDim, number>

    constructor(...components: number[]) {
        this.components = components as Tuple<NDim, number>
    }

    /**
     * Retrieves a specific item (component) from the vector by its index.
     * 
     * @param index The index of the component to retrieve.
     * @returns The value of the component at the specified index.
     */
    public getItem(index: number): number {
        return this.components[index]
    }

    public setItem(index: number, value: number): number {
        this.components[index] = value
        return this.components[index]
    }

    /**
     * Provides the length (dimensionality) of the vector.
     * 
     * @returns The dimensionality of the vector as NDim.
     */
    public get length(): NDim {
        return this.components.length as NDim
    }

    public static from<N extends Dim>(tuple: Tuple<N, number>): NDimVector<N> {
        return new NDimVector<N>(...tuple)
    }

    /**
     * Returns unwrapped vector components. If a plain array or tuple is received, it will be returned, but 
     * if the vector is an instance of this class, the components of the class will be returned.
     * 
     * @param vector the vector from which we will retrieve components.
     * @returns if vector is an instance of NDimVector, returns vector.components, else return the tuple.
     */
    public static getComponents<N extends Dim>(vector: Tuple<N> | NDimVector<N> | Array<number>): Tuple<N> {
        return vector instanceof NDimVector ? vector.components : vector as Tuple<N>
    }

    public get mappedComponents(): NDimVectorComponents<NDim> {
        return this.components.reduce((acc, comp, i) => 
            ({ ...acc, [VectorComponentLabels[i]]: comp }), {} as NDimVectorComponents<NDim>)
    }

    public map(fn: (n: number, i: number) => number): NDimVector<NDim> {
        return new NDimVector(...map(fn, this.components))
    }

    // ********************** Math Helpers *****************************

    /**
     * Adds another vector to this vector.
     * 
     * @param other The vector to add.
     * @returns A new NDimVector representing the sum.
     */
    public add(other: Tuple<NDim, number> | NDimVector<NDim>): NDimVector<NDim> {
        const sum = add(this.components, NDimVector.getComponents<NDim>(other))
        return new NDimVector<NDim>(...sum);
    }

    /**
     * Subtracts another vector from this vector.
     * 
     * @param other The vector to subtract.
     * @returns A new NDimVector representing the difference.
     */
    public sub(other: Tuple<NDim, Dim> | NDimVector<NDim> | Array<number>): NDimVector<NDim> {
        const difference = sub(this.components, NDimVector.getComponents<NDim>(other))
        return new NDimVector<NDim>(...difference);
    }

    /**
     * Multiplies this vector by a scalar value.
     * 
     * @param scalar The scalar value to multiply by.
     * @returns A new NDimVector representing the product.
     */
    public mul(scalar: number): NDimVector<NDim> {
        const product = mul(this.components, scalar)
        return new NDimVector<NDim>(...product)
    }

    /**
     * Divides this vector by a scalar value.
     * 
     * @param scalar The scalar value to divide by.
     * @returns A new NDimVector representing the quotient.
     */
    public div(scalar: number): NDimVector<NDim> {
        const quotient = div(this.components, scalar)
        return new NDimVector<NDim>(...quotient)
    }

    /**
     * Calculates the dot product of this vector with another vector.
     * 
     * @param other The vector to calculate the dot product with.
     * @returns The dot product as a number.
     */
    public dot(other: Tuple<NDim, number> | NDimVector<NDim>): number {
        return dot(this.components, NDimVector.getComponents<NDim>(other))
    }

    /**
     * Calculates the magnitude (length) of this vector.
     * 
     * @returns The magnitude of the vector as a number.
     */
    public get magnitude(): number {
        return magnitude(this.components)
    }

    public get magnitudeSquared(): number {
        return magnitudeSquared(this.components)
    }

    /**
     * Converts this vector to a unit vector (a vector with magnitude 1).
     * 
     * @returns A new NDimVector representing the unit vector.
     */
    public get unit(): NDimVector<NDim> {
        return new NDimVector<NDim>(...unit(this.components))
    }

    /**
     * Calculates the angle in radians between this vector and another vector.
     * 
     * @param other The vector to calculate the angle with.
     * @returns The angle in radians as a number.
     */
    public angle(other: Tuple<NDim, number> | NDimVector<NDim>): number {
        return angle(this.components, NDimVector.getComponents<NDim>(other))
    }

    /**
     * Calculates the midpoint between this vector and another vector.
     * 
     * @param other The vector to calculate the midpoint with.
     * @returns A new NDimVector representing the midpoint.
     */
    public mid(other: Tuple<NDim, number> | NDimVector<NDim>): NDimVector<NDim> {
        const midpointVector = midpoint(this.components, NDimVector.getComponents<NDim>(other))
        return new NDimVector<NDim>(...midpointVector)
    }
}

