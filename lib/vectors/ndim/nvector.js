import { add, angle, div, dot, magnitude, magnitudeSquared, map, midpoint, mul, sub, unit } from "./math.js";
const VectorComponentLabels = ["x", "y", "z", "w"];
/**
 * Represents an N-dimensional vector with type-safe component management.
 * Allows for the creation and manipulation of vectors with a predefined number of dimensions.
 *
 * @typeParam NDim - The dimension of the vector.
 */
export class NDimVector {
    components;
    constructor(...components) {
        this.components = components;
    }
    /**
     * Retrieves a specific item (component) from the vector by its index.
     *
     * @param index The index of the component to retrieve.
     * @returns The value of the component at the specified index.
     */
    getItem(index) {
        return this.components[index];
    }
    setItem(index, value) {
        this.components[index] = value;
        return this.components[index];
    }
    /**
     * Provides the length (dimensionality) of the vector.
     *
     * @returns The dimensionality of the vector as NDim.
     */
    get length() {
        return this.components.length;
    }
    static from(tuple) {
        return new NDimVector(...tuple);
    }
    /**
     * Returns unwrapped vector components. If a plain array or tuple is received, it will be returned, but
     * if the vector is an instance of this class, the components of the class will be returned.
     *
     * @param vector the vector from which we will retrieve components.
     * @returns if vector is an instance of NDimVector, returns vector.components, else return the tuple.
     */
    static getComponents(vector) {
        return vector instanceof NDimVector ? vector.components : vector;
    }
    get mappedComponents() {
        return this.components.reduce((acc, comp, i) => ({ ...acc, [VectorComponentLabels[i]]: comp }), {});
    }
    map(fn) {
        return new NDimVector(...map(fn, this.components));
    }
    // ********************** Math Helpers *****************************
    /**
     * Adds another vector to this vector.
     *
     * @param other The vector to add.
     * @returns A new NDimVector representing the sum.
     */
    add(other) {
        const sum = add(this.components, NDimVector.getComponents(other));
        return new NDimVector(...sum);
    }
    /**
     * Subtracts another vector from this vector.
     *
     * @param other The vector to subtract.
     * @returns A new NDimVector representing the difference.
     */
    sub(other) {
        const difference = sub(this.components, NDimVector.getComponents(other));
        return new NDimVector(...difference);
    }
    /**
     * Multiplies this vector by a scalar value.
     *
     * @param scalar The scalar value to multiply by.
     * @returns A new NDimVector representing the product.
     */
    mul(scalar) {
        const product = mul(this.components, scalar);
        return new NDimVector(...product);
    }
    /**
     * Divides this vector by a scalar value.
     *
     * @param scalar The scalar value to divide by.
     * @returns A new NDimVector representing the quotient.
     */
    div(scalar) {
        const quotient = div(this.components, scalar);
        return new NDimVector(...quotient);
    }
    /**
     * Calculates the dot product of this vector with another vector.
     *
     * @param other The vector to calculate the dot product with.
     * @returns The dot product as a number.
     */
    dot(other) {
        return dot(this.components, NDimVector.getComponents(other));
    }
    /**
     * Calculates the magnitude (length) of this vector.
     *
     * @returns The magnitude of the vector as a number.
     */
    get magnitude() {
        return magnitude(this.components);
    }
    get magnitudeSquared() {
        return magnitudeSquared(this.components);
    }
    /**
     * Converts this vector to a unit vector (a vector with magnitude 1).
     *
     * @returns A new NDimVector representing the unit vector.
     */
    get unit() {
        return new NDimVector(...unit(this.components));
    }
    /**
     * Calculates the angle in radians between this vector and another vector.
     *
     * @param other The vector to calculate the angle with.
     * @returns The angle in radians as a number.
     */
    angle(other) {
        return angle(this.components, NDimVector.getComponents(other));
    }
    /**
     * Calculates the midpoint between this vector and another vector.
     *
     * @param other The vector to calculate the midpoint with.
     * @returns A new NDimVector representing the midpoint.
     */
    mid(other) {
        const midpointVector = midpoint(this.components, NDimVector.getComponents(other));
        return new NDimVector(...midpointVector);
    }
}
//# sourceMappingURL=nvector.js.map