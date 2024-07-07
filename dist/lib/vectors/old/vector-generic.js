export class Vec2GenericBase {
    components;
    constructor(x, y) {
        this.components = [x, y];
    }
    get x() {
        return this.components[0];
    }
    get y() {
        return this.components[1];
    }
    set x(val) {
        this.components[0] = val;
    }
    set y(val) {
        this.components[1] = val;
    }
    get id() {
        return this;
    }
    // I dont know how to deal with state change and side effects anymore... imperative philosophy is kinda icky
    applyArithmetic(fn, self, other, update = false) {
        const components = fn(self, other);
        if (update) {
            [this.x, this.y] = components;
            return this;
        }
        else {
            return new self.constructor(...components);
        }
    }
    eq(other) {
        return this.x == other.x && this.y == other.y;
    }
    static is(val1, val2) {
        return Object.is(val1, val2);
    }
    toString() {
        return "[" + this.x + ", " + this.y + "]";
    }
}
//# sourceMappingURL=vector-generic.js.map