import { Vec2GenericBase } from "./vector-generic.js";
export class Vec2 extends Vec2GenericBase {
    _mag = 0;
    _magSquared = 0;
    /**
     * Addition. Add another vector to this vector.
     *
     * @param addend the vector to add to this vector.
     * @param update change the value of this vector to the sum.
     *
     * @returns the vector sum of this vector and the vector addend.
     */
    add(addend, update = false) {
        const fn = (l, r) => [l.x + r.x, l.y + r.y];
        return this.applyArithmetic(fn, this, addend, update);
    }
    /**
     * Subtraction. Subtract another vector from this vector.
     *
     * @param subtrahend the vector to subtract from this vector.
     * @param update change the value of this vector to the difference.
     *
     * @returns the vector difference between this vector and the vector subtrahend.
     */
    sub(subtrahend, update = false) {
        const fn = (l, r) => [l.x - r.x, l.y - r.y];
        return this.applyArithmetic(fn, this, subtrahend, update);
    }
    /**
     * Multiply. Multiply this vector by the numeric other parameter.
     *
     * @param multiplier the number by which this vector will be multiplied
     * @param update change the value of this vector to the product.
     *
     * @returns the vector product of this vector and the numeric multiplier.
     */
    mul(multiplier, update = false) {
        const fn = (l, r) => [l.x * r, l.y * r];
        return this.applyArithmetic(fn, this, multiplier, update);
    }
    /**
     * Division. Divide this vector by the numeric other parameter.
     *
     * @param divisor the number by which this vector will be divided.
     * @param update change the value of this vector to the quotient.
     *
     * @returns the vector quotient of this vector divided by the numeric divisor.
     */
    div(divisor, update = false) {
        const fn = (l, r) => [l.x / r, l.y / r];
        return this.applyArithmetic(fn, this, divisor, update);
    }
    /**
     * Midpoint of two vectors.
     *
     * @param lhs left arg
     * @param rhs right arg
     *
     * @returns Vector midpoint of two vectors.
     */
    static mid(lhs, rhs) {
        return new Vec2(...[(lhs.x + rhs.x) / 2, (lhs.y + rhs.y) / 2]);
    }
    /**
     * Cross Product
     *
     * @param other
     * @returns numeric cross product of this vector and another vector.
     */
    cross(other) {
        return this.x * other.y - this.y * other.x;
    }
    dot(other) {
        return this.x * other.x + this.y * other.y;
    }
    get unit() {
        return this.div(this.magnitude);
    }
    get theta() {
        return Math.atan2(this.y, this.x);
    }
    get magnitudeSquared() {
        if (this._magSquared === 0)
            this._magSquared = (this.x ** 2 + this.y ** 2);
        return this._magSquared;
    }
    get magnitude() {
        if (this._mag === 0)
            this._mag = Math.sqrt(this.magnitudeSquared);
        return this._mag;
    }
    static get zero() {
        return new Vec2(0, 0);
    }
}
//# sourceMappingURL=vector.js.map