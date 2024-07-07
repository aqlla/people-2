export interface IOrderedPair<TNum = number> {
    x: TNum;
    y: TNum;
}

export type VectorMathOperand<
        TNum = number, 
        TVec2 = Vec2GenericBase<TNum>> 
    = TVec2 | TNum | [TNum, TNum];

export type NDimFn<
        TLhs extends VectorMathOperand<TNum>, 
        TRhs extends VectorMathOperand<TNum>, 
        TReturn extends VectorMathOperand<TNum>, 
        TNum = number> 
    = (lhs: TLhs, rhs: TRhs) => TReturn; 

export type VectorFn<
        TLhs extends VectorMathOperand<TNum>, 
        TRhs extends VectorMathOperand<TNum>, 
        TNum = number> 
    = NDimFn<TLhs, TRhs, [TNum, TNum], TNum>;

export type ScalarFn<
        TLhs extends Vec2GenericBase<TNum>, 
        TRhs extends VectorMathOperand<TNum>, 
        TNum = number> 
    = NDimFn<TLhs, TRhs, TNum, TNum>;

    
export class Vec2GenericBase<TNum = number> implements IOrderedPair<TNum> {
    private components: [TNum, TNum];

    constructor(x: TNum, y: TNum) {
        this.components = [x, y];
    }

    public get x(): TNum {
        return this.components[0];
    }
    
    public get y(): TNum {
        return this.components[1];
    }

    protected set x(val: TNum) {
        this.components[0] = val;
    }

    protected set y(val: TNum) {
        this.components[1] = val;
    }

    public get id(): Vec2GenericBase<TNum> {
        return this
    }

    // I dont know how to deal with state change and side effects anymore... imperative philosophy is kinda icky
    protected applyArithmetic<TThis extends Vec2GenericBase<TNum>, TOther extends VectorMathOperand<TNum>>(
            fn: VectorFn<TThis, TOther, TNum>,
            self: TThis,
            other: TOther, 
            update: boolean = false): this {

        const components = fn(self, other);

        if (update) {
            [this.x, this.y] = components;
            return this;
        } else {
            return new (<any>self.constructor)(...components);
        }
    }

    public eq(other: Vec2GenericBase<TNum>): boolean {
        return this.x == other.x && this.y == other.y;
    }

    public static is(val1: Vec2GenericBase, val2: Vec2GenericBase): boolean {
        return Object.is(val1, val2)
    }

    public toString(): string {
        return "[" + this.x + ", " + this.y + "]"; 
    }
}