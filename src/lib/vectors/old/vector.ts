import { Vec2GenericBase, VectorFn } from "./vector-generic.js"

    
export class Vec2 extends Vec2GenericBase<number> {
    private _mag: number = 0
    private _magSquared: number = 0

    /**
     * Addition. Add another vector to this vector.
     * 
     * @param addend the vector to add to this vector.
     * @param update change the value of this vector to the sum.
     * 
     * @returns the vector sum of this vector and the vector addend.
     */
    public add(addend: Vec2, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, Vec2>
            = (l, r) => [l.x + r.x, l.y + r.y]
        return this.applyArithmetic(fn, this, addend, update)
    }

    /**
     * Subtraction. Subtract another vector from this vector.
     * 
     * @param subtrahend the vector to subtract from this vector.
     * @param update change the value of this vector to the difference.
     * 
     * @returns the vector difference between this vector and the vector subtrahend.
     */
    public sub(subtrahend: Vec2, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, Vec2>
            = (l, r) => [l.x - r.x, l.y - r.y]
        return this.applyArithmetic(fn, this, subtrahend, update)
    }

    /**
     * Multiply. Multiply this vector by the numeric other parameter.
     * 
     * @param multiplier the number by which this vector will be multiplied
     * @param update change the value of this vector to the product.
     * 
     * @returns the vector product of this vector and the numeric multiplier.
     */
    public mul(multiplier: number, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, number>
            = (l, r) => [l.x * r, l.y * r]
        return this.applyArithmetic(fn, this, multiplier, update)
    }

    /**
     * Division. Divide this vector by the numeric other parameter.
     * 
     * @param divisor the number by which this vector will be divided.
     * @param update change the value of this vector to the quotient.
     * 
     * @returns the vector quotient of this vector divided by the numeric divisor.
     */
    public div(divisor: number, update: boolean = false): Vec2 {
        const fn: VectorFn<Vec2, number>
            = (l, r) => [l.x / r, l.y / r]
        return this.applyArithmetic(fn, this, divisor, update)
    }

    /**
     * Midpoint of two vectors.
     * 
     * @param lhs left arg
     * @param rhs right arg
     * 
     * @returns Vector midpoint of two vectors.
     */
    public static mid(lhs: Vec2, rhs: Vec2): Vec2 {
        return new Vec2(...[(lhs.x + rhs.x) / 2, (lhs.y + rhs.y) / 2])
    }

    /**
     * Cross Product
     * 
     * @param other 
     * @returns numeric cross product of this vector and another vector.
     */
    public cross(other: Vec2): number {
        return this.x * other.y - this.y * other.x
    }

    public dot(other: Vec2): number {
        return this.x * other.x + this.y * other.y
    }

    public get unit(): Vec2 {
        return this.div(this.magnitude);
    }

    public get theta(): number {
        return Math.atan2(this.y, this.x)
    }

    public get magnitudeSquared(): number {
        if (this._magSquared === 0)
            this._magSquared = (this.x ** 2 + this.y ** 2)

        return this._magSquared
    }

    public get magnitude(): number {
        if (this._mag === 0)
            this._mag = Math.sqrt(this.magnitudeSquared)

        return this._mag
    }

    public static get zero(): Vec2 {
        return new Vec2(0, 0)
    }
}