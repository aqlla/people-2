import { NDimVector } from "./ndim/index.js";
const dimensions = 2;
export class Vector2 extends NDimVector {
    dimensions = dimensions;
    static get zero() {
        return new Vector2(0, 0);
    }
    get x() {
        return this.getItem(0);
    }
    get y() {
        return this.getItem(1);
    }
    set x(val) {
        this.setItem(0, val);
    }
    set y(val) {
        this.setItem(1, val);
    }
}
//# sourceMappingURL=vector2.js.map