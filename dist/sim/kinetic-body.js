import { scale } from "../lib/math.js";
import { NDimVector } from "../lib/vectors/ndim/nvector.js";
// @Drawable(Shape.Circle, "#666666")
export class MassiveBody {
    m;
    r;
    pos;
    vel;
    acc;
    dimensions;
    static idIncrementor = 1;
    _id = 0;
    _static = false;
    constructor(args) {
        this.dimensions = args.dimensions;
        this.m = args.m ?? MassiveBody.getRandomMass();
        this.r = args.r ?? MassiveBody.getRadiusFromMass(this.m);
        this.vel = args.vel ?? this.zeroVector;
        this.acc = args.acc ?? this.zeroVector;
        this.pos = args.pos ?? this.zeroVector;
        this._static = args.isStatic ?? false;
        this._id = MassiveBody.idIncrementor++;
    }
    get zeroVector() {
        return new NDimVector(0, 0);
    }
    get momentum() {
        return this.vel.mul(this.m);
    }
    get id() {
        return this._id;
    }
    eq(other) {
        return this.id == other.id;
    }
    get isStatic() {
        return this._static;
    }
    // 100.000.000x 
    static get max_mass() {
        return 50000000;
    }
    static get min_mass() {
        return 100000;
    }
    static get max_radius() {
        return 32;
    }
    static get min_radius() {
        return 8;
    }
    static get raw_max_radius() {
        return MassiveBody.getRadiusFromMass(MassiveBody.max_mass, false);
    }
    static getRadiusFromMass(mass, scaled = true) {
        // just volume formula
        const raw_radius = Math.cbrt((3 * mass) / (4 * Math.PI));
        if (scaled) {
            return raw_radius * (MassiveBody.max_radius / MassiveBody.raw_max_radius);
        }
        else {
            return raw_radius;
        }
    }
    static getRandomMass(max = MassiveBody.max_mass, min = MassiveBody.min_mass) {
        const uniform = Math.random();
        let mass = uniform;
        // const beta_left = (uniform < 0.5) ? 2 * uniform : 2 * (1-uniform)
        if (uniform > 0.999) {
            mass *= 1000;
        }
        else if (uniform > 0.99) {
            mass *= 100;
        }
        else if (uniform > 0.75) {
            mass *= 10;
        }
        return scale(mass, max, min);
    }
    static collisionMomentum(b1, b2) {
        const mSum = b1.m + b2.m;
        // const vx = (b1.m * b1.vel.x + b2.m * b2.vel.x) / mSum
        // const vy = (b1.m * b1.vel.y + b2.m * b2.vel.y) / mSum
        const momentum1 = b1.vel.mul(b1.m / mSum);
        const momentum2 = b2.vel.mul(b2.m / mSum);
        return momentum1.add(momentum2);
    }
    static nCollisionMomentum(bodies) {
        // TODO: find better way to get zero vector without cheating like this...
        const zeroVector = new NDimVector(0, 0);
        const totalMass = bodies.reduce((acc, b) => acc + b.m, 0);
        return bodies.reduce((acc, b) => acc.add(b.vel.mul(b.m / totalMass)), zeroVector);
    }
    integrate(dt) {
        if (this.isStatic) {
            this.pos = this.zeroVector;
            this.vel = this.zeroVector;
        }
        else {
            this.pos = this.pos.add(this.vel.mul(dt));
            this.vel = this.vel.add(this.acc.mul(dt));
        }
        this.acc = this.zeroVector;
    }
    toString() {
        return `id: ${this.id}\n m: ${this.m}\n r: ${this.r}\n pos: ${this.pos} vel: ${this.vel}`;
    }
}
