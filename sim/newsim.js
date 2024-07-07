import { NDimVector } from "../lib/vectors/ndim/index.js";
import { MassiveBody } from "./kinetic-body.js";
import { SimLoop } from "./gameloop.js";
import { scale } from "../lib/math.js";
import { Vector2 } from "../lib/vectors/vector2.js";
const dimensions = 2;
export class NewSim extends SimLoop {
    bodies = new Map();
    bounds = { min: [0, 0], max: [500, 500] };
    margin = 75;
    creationMargin = 100;
    _oobCount = 0;
    // configurables:
    separationEnabled = true;
    separationFactor = 1.5;
    separationRange = 20;
    alignmentEnabled = true;
    alignmentRange = 150;
    alignmentFactor = 0.01;
    cohesionEnabled = true;
    cohesionFactor = .01;
    cohesionRange = 250;
    constructor(args) {
        super();
        this.bounds.max = args.bounds;
        this.makeTestBodies(args.population ?? 50);
    }
    get canStart() {
        switch (true) {
            case this.bodies.size < 1:
                return [false, "No bodies, nothing to simulate."];
            default:
                return super.canStart;
        }
    }
    static instance(args) {
        if (!NewSim._instance)
            NewSim._instance = new NewSim(args);
        return NewSim._instance;
    }
    makeTestBodies(n) {
        const maxV = 50;
        const creationBounds = this.getMarginBounds(this.creationMargin);
        for (let i = 0; i < n; i++) {
            this.addBody(new MassiveBody({
                dimensions: dimensions,
                pos: this.getRandomPos(creationBounds.max, creationBounds.min),
                vel: this.getRandomPos([maxV, maxV], [-maxV, -maxV]),
                r: 8
            }));
        }
    }
    getRandomPos(max = this.bounds.max, min = this.bounds.min) {
        const x = scale(Math.random(), max[0], min[0]);
        const y = scale(Math.random(), max[1], min[1]);
        return new NDimVector(x, y);
    }
    updatePhysics(dt) {
        for (const [_, body] of this.bodies.entries()) {
            this.repulsiveBoundaries(body);
            this.separation(body);
            this.cohesion(body);
            this.alignment(body);
            this.speedLimit(body);
        }
        for (const b of this.entities())
            b.integrate(dt);
    }
    // Boids Rules
    separation(body) {
        if (!this.separationEnabled)
            return;
        const zeroVec = Vector2.zero;
        const distance = b => b.pos.sub(body.pos).magnitude;
        const canSee = d => d < this.separationRange;
        let accumulator = Vector2.zero;
        // for (const b of this.entities()) {
        //     if (b.id !== body.id) {
        //         const distanceVec = body.pos.sub(b.pos)
        //         const distance = distanceVec.magnitude
        //         if (distance < this.separationRange) {
        //             // accumulator = accumulator.add(b.pos)
        //             accumulator = accumulator.add(distanceVec.div(distance))
        //         }
        //     }
        // }
        const n = Array
            .from(this.bodies.values())
            .filter(b => body.id !== b.id && canSee(distance(b)))
            // lol ignore this, i just want to commit so i can sleep
            .reduce((acc, b) => acc.add(body.pos.sub(b.pos).div(distance(b))), zeroVec)
            .mul(this.separationFactor);
        // TODO: i think i fucked something up, check boids algos
        const separationForce = accumulator.mul(this.separationFactor);
        body.vel = body.vel.add(separationForce);
        return body;
    }
    alignment(body) {
        if (!this.alignmentEnabled)
            return;
        const zeroVec = Vector2.zero;
        // // let neighbors = 0
        // let accumulator = zeroVec
        // for (const b of this.entities()) {
        //     if (b.id !== body.id) {
        //         const distance = b.pos.sub(body.pos).magnitude
        //         if (distance < this.alignmentRange) {
        //             accumulator = accumulator.add(b.vel)
        //             neighbors++
        //         }
        //     }
        // }
        // same, but functional
        const distance = b => b.pos.sub(body.pos).magnitude;
        const canSee = d => d < this.alignmentRange;
        const neighbors = Array
            .from(this.bodies.values())
            .filter(b => body.id !== b.id && canSee(distance(b)));
        // if (neighbors.length) {
        const aligningForce = neighbors.length == 0
            ? zeroVec
            : neighbors
                .reduce((acc, b) => acc.add(b.vel), zeroVec)
                .div(neighbors.length)
                .sub(body.vel)
                .mul(this.alignmentFactor);
        body.vel = body.vel.add(aligningForce);
        return body;
    }
    cohesion(body) {
        if (!this.cohesionEnabled)
            return;
        let neighbors = 0;
        let accumulator = Vector2.zero;
        for (const b of this.entities()) {
            if (b.id !== body.id) {
                const distance = b.pos.sub(body.pos).magnitude;
                if (distance < this.cohesionRange) {
                    accumulator = accumulator.add(b.pos);
                    neighbors++;
                }
            }
        }
        if (neighbors) {
            body.vel = body.vel.add(accumulator
                .div(neighbors)
                .sub(body.pos)
                .mul(this.cohesionFactor));
        }
        return body;
    }
    // Basic Rules 
    repulsiveBoundaries(body) {
        const turnFactor = 1.5;
        this.forDims(d => {
            if (body.pos[d] < this.margin)
                body.vel[d] += turnFactor;
            else if (body.pos[d] > (this.bounds.max[d] - this.margin))
                body.vel[d] -= turnFactor;
        });
        return body;
    }
    speedLimit(body) {
        const maxSpeed = 150;
        const speed = body.vel.magnitude;
        if (speed > maxSpeed)
            body.vel = body.vel.div(speed).mul(maxSpeed);
        return body;
    }
    wrapWorldBoundaries(body) {
        if (body.pos[0] <= 0) {
            body.pos = new NDimVector(this.bounds.max[0], body.pos[1]);
        }
        else if (body.pos[0] >= this.bounds.max[0]) {
            body.pos = new NDimVector(this.bounds.min[0], body.pos[1]);
        }
        if (body.pos[1] <= 0) {
            body.pos = new NDimVector(body.pos[0], this.bounds.max[1]);
        }
        else if (body.pos[1] >= this.bounds.max[1]) {
            body.pos = new NDimVector(body.pos[0], this.bounds.min[1]);
        }
    }
    forDims(fn) {
        for (let d = 0; d < dimensions; d++) {
            fn(d);
        }
    }
    getMarginBounds(margin) {
        return {
            max: this.bounds.max.map(x => x - this.creationMargin),
            min: this.bounds.min.map(x => x + this.creationMargin)
        };
    }
    isOob(pos) {
        const min = this.bounds.min;
        const max = this.bounds.max;
        for (let i = 0; i < dimensions; i++) {
            if (pos[i] <= min[i] || pos[i] >= max[i]) {
                return true;
            }
        }
        return false;
    }
    *entities() {
        for (const [_, b] of Array.from(this.bodies))
            yield b;
    }
    addBody(body) {
        this.bodies.set(body.id, body);
    }
    get oobCount() {
        return this._oobCount;
    }
}
