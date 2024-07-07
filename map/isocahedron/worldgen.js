import { clamp } from "lib";
import { NDimVector } from "lib/vectors";
const pull = (arr, index) => {
    const val = arr[index];
    arr.splice(index, 1);
    return val;
};
class Point extends NDimVector {
    static idIncrementor = 0;
    id = ++Point.idIncrementor;
    faces = [];
    _fixedComponents = undefined;
    subdivide(point, count, checkFn) {
        const segments = [];
        segments.push(this);
        for (let i = 0; i < count; i++) {
            const newPt = new Point(this.x * (1 - (i / count)) + point.x * (i / count), this.y * (1 - (i / count)) + point.y * (i / count), this.z * (1 - (i / count)) + point.z * (i / count));
            segments.push(checkFn(newPt));
        }
        segments.push(point);
        return segments;
    }
    segment(point, percent) {
        const pct = clamp(percent, 0.01, 1);
        return new Point(point.x * (1 - pct) + this.x * pct, point.y * (1 - pct) + this.y * pct, point.z * (1 - pct) + this.z * pct);
    }
    midpoint(point, location) {
        return this.segment(point, .5);
    }
    projection(radius, percent = 1.0) {
        const pct = clamp(percent, 0, 1);
        // const yx = this.y / this.x
        // const zx = this.z / this.x
        // const zy = this.z / this.y
        const ratio = radius / this.magnitude;
        return new Point(this.x * ratio * pct, this.y * ratio * pct, this.z * ratio * pct);
    }
    addFace(face) {
        return this.faces.push(face);
    }
    get orderedFaces() {
        const workingArr = this.faces.slice();
        const ret = [];
        let i = 0;
        while (i < this.faces.length) {
            if (i === 0) {
                ret.push(pull(workingArr, i));
            }
            else {
                let hit = false;
                let j = 0;
                while (j < workingArr.length && !hit) {
                    if (workingArr[j].isAdjacentTo(ret[i - 1])) {
                        hit = true;
                        ret.push(pull(workingArr, j));
                    }
                    j++;
                }
            }
            i++;
        }
        return ret;
    }
    findCommonFace(other, notThisFace) {
        for (let i = 0; i < this.faces.length; i++) {
            for (let j = 0; j < other.faces.length; j++) {
                if (this.faces[i].eq(other.faces[j]) && !notThisFace.eq(this.faces[i])) {
                    return this.faces[i];
                }
            }
        }
        return null;
    }
    get x() { return this.components[0]; }
    get y() { return this.components[1]; }
    get z() { return this.components[2]; }
    get fixed() {
        return this.fixedComponents();
    }
    fixedComponents(precision = 3) {
        if (this._fixedComponents === undefined) {
            this._fixedComponents = [
                this.x.toFixed(precision),
                this.y.toFixed(precision),
                this.z.toFixed(precision)
            ];
        }
        return this._fixedComponents;
    }
    eq(other) {
        return this.fixed.every((c, i) => c === other.fixed[i]);
    }
    toString() {
        return '' + this.x + ', ' + this.y + ', ' + this.z;
    }
    toJson() {
        return {
            x: this.x,
            y: this.y,
            z: this.z
        };
    }
}
class Face {
    static idIncrementor = 0;
    id = ++Face.idIncrementor;
    _centroid = undefined;
    points;
    constructor(points, register = true) {
        this.points = points;
        if (register) {
            this.points.forEach(p => p.addFace(this));
        }
    }
    getOtherPoints(point) {
        let other = [];
        for (let i = 0; i < this.points.length; i++) {
            if (!point.eq(this.points[i])) {
                other.push(this.points[i]);
            }
        }
        return other;
    }
    findThirdPoint(p1, p2) {
        return this.points.find(p => !p.eq(p1) && !p.eq(p2));
    }
    getCentroid(clear) {
        if (this.centroid && clear) {
            this._centroid = undefined;
        }
        return this.centroid;
    }
    get centroid() {
        if (this._centroid === undefined) {
            this._centroid = new Point((this.points[0].x + this.points[1].x + this.points[2].x) / 3, (this.points[0].y + this.points[1].y + this.points[2].y) / 3, (this.points[0].z + this.points[1].z + this.points[2].z) / 3);
        }
        return this._centroid;
    }
    isAdjacentTo(other) {
        let count = 0;
        for (let i = 0; i < this.points.length; i++) {
            for (let j = 0; j < other.points.length; j++) {
                if (this.points[i].eq(other.points[j])) {
                    count++;
                }
            }
        }
        return count === 2;
    }
    eq(other) {
        return this.id === other.id;
    }
}
// https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
const surfaceNormal = (...ps) => {
    const U = new NDimVector(...ps[1].sub(ps[0]).components);
    const V = new NDimVector(...ps[2].sub(ps[0]).components);
    return {
        x: U.components[1] * V.components[2] - U.components[2] * V.components[1],
        y: U.components[2] * V.components[0] - U.components[0] * V.components[2],
        z: U.components[0] * V.components[1] - U.components[1] * V.components[0]
    };
};
const pointingAwayFromOrigin = (p, v) => ((p.x * v.x) >= 0) && ((p.y * v.y) >= 0) && ((p.z * v.z) >= 0);
class Tile {
    static idIncrementor = 0;
    id = ++Tile.idIncrementor;
    size = 1;
    center;
    faces;
    bounds = [];
    neighbors = [];
    neighborIds;
    constructor(center, size = 1) {
        this.size = clamp(size, 0.01, 1.0);
        this.center = center;
        this.faces = center.orderedFaces;
        const neighHash = {};
        for (let i = 0; i < this.faces.length; i++) {
            this.bounds.push(this.faces[i].centroid.segment(this.center, size));
            const others = this.faces[i].getOtherPoints(this.center);
            for (let j = 0; j < 2; j++) {
                neighHash[others[j].id] = 1;
            }
        }
        this.neighborIds = Object.keys(neighHash);
        const normal = surfaceNormal(...this.bounds);
        if (!pointingAwayFromOrigin(this.center, normal)) {
            this.bounds.reverse();
        }
    }
    eq(other) {
        return this.id === other.id;
    }
    getCoords(radius, boundaryNum) {
        let point = this.center;
        if (typeof boundaryNum === "number" && boundaryNum < this.bounds.length) {
            point = this.bounds[boundaryNum];
        }
        const phi = Math.acos(point.y / radius); //lat 
        const theta = (Math.atan2(point.x, point.z) + Math.PI + Math.PI / 2) % (Math.PI * 2) - Math.PI; // lon
        // theta is a hack, since I want to rotate by Math.PI/2 to start.  sorryyyyyyyyyyy
        return {
            lat: 180 * phi / Math.PI - 90,
            lon: 180 * theta / Math.PI
        };
    }
    scaledBounds(scale = 1) {
        const ret = [];
        for (let i = 0; i < this.bounds.length; i++) {
            ret.push(this.center.segment(this.bounds[i], 1 - clamp(scale, 0, 1)));
        }
        return ret;
    }
    toJson() {
        return {
            center: this.center.toJson(),
            bounds: this.bounds.map(p => p.toJson())
        };
    }
}
class Grid {
    radius;
    hexSize;
    nDivisions;
    tileMap = {};
    tiles = [];
    edges = [];
    faces = [];
    points;
    constructor(radius, nDivisions, hexSize) {
        this.radius = radius;
        this.nDivisions = nDivisions;
        this.hexSize = hexSize;
        const tao = 1.61803399;
        const corners = [
            new Point(1000, tao * 1000, 0),
            new Point(-1000, tao * 1000, 0),
            new Point(1000, -tao * 1000, 0),
            new Point(-1000, -tao * 1000, 0),
            new Point(0, 1000, tao * 1000),
            new Point(0, -1000, tao * 1000),
            new Point(0, 1000, -tao * 1000),
            new Point(0, -1000, -tao * 1000),
            new Point(tao * 1000, 0, 1000),
            new Point(-tao * 1000, 0, 1000),
            new Point(tao * 1000, 0, -1000),
            new Point(-tao * 1000, 0, -1000)
        ];
        const points = {};
        for (var i = 0; i < corners.length; i++) {
            points[corners[i].id] = corners[i];
        }
        const faces = [
            new Face([corners[0], corners[1], corners[4]], false),
            new Face([corners[1], corners[9], corners[4]], false),
            new Face([corners[4], corners[9], corners[5]], false),
            new Face([corners[5], corners[9], corners[3]], false),
            new Face([corners[2], corners[3], corners[7]], false),
            new Face([corners[3], corners[2], corners[5]], false),
            new Face([corners[7], corners[10], corners[2]], false),
            new Face([corners[0], corners[8], corners[10]], false),
            new Face([corners[0], corners[4], corners[8]], false),
            new Face([corners[8], corners[2], corners[10]], false),
            new Face([corners[8], corners[4], corners[5]], false),
            new Face([corners[8], corners[5], corners[2]], false),
            new Face([corners[1], corners[0], corners[6]], false),
            new Face([corners[11], corners[1], corners[6]], false),
            new Face([corners[3], corners[9], corners[11]], false),
            new Face([corners[6], corners[10], corners[7]], false),
            new Face([corners[3], corners[11], corners[7]], false),
            new Face([corners[11], corners[6], corners[7]], false),
            new Face([corners[6], corners[0], corners[10]], false),
            new Face([corners[9], corners[1], corners[11]], false)
        ];
        const getPointsIfExist = (point) => {
            if (points[point.id]) {
                return points[point.id];
            }
            else {
                points[point.id] = point;
                return point;
            }
        };
        const newFaces = [];
        for (let f = 0; f < faces.length; f++) {
            let prev;
            let bottom = [faces[f].points[0]];
            let left = faces[f].points[0].subdivide(faces[f].points[1], nDivisions, getPointsIfExist);
            let right = faces[f].points[0].subdivide(faces[f].points[2], nDivisions, getPointsIfExist);
            for (let i = 0; i <= nDivisions; i++) {
                prev = bottom;
                bottom = left[i].subdivide(right[i], i, getPointsIfExist);
                for (let j = 0; j < i; j++) {
                    newFaces.push(new Face([prev[j], bottom[j], bottom[j + 1]]));
                    if (j > 0) {
                        newFaces.push(new Face([prev[j - 1], prev[j], bottom[j]]));
                    }
                }
            }
        }
        this.faces = newFaces;
        const newPoints = {};
        for (const p of Object.values(points)) {
            const np = p.projection(radius);
            newPoints[np.id] = np;
        }
        this.points = newPoints;
        // create tiles and store in a lookup for references
        for (const p of Object.values(points)) {
            const nt = new Tile(p, hexSize);
            this.tiles.push(nt);
            this.tileMap[nt.id] = nt;
        }
        // resolve neighbor references now that all have been created
        // for (const t in this.tiles) {
        // 	const _this = this;
        // 	this.tiles[t].neighbors = this.tiles[t].neighborIds.map(function(item){return _this.tileLookup[item]});
        // }
        for (const t of this.tiles) {
            t.neighbors = t.neighborIds.map(id => this.tileMap[id]);
        }
    }
    toJson() {
        return JSON.stringify({
            radius: this.radius,
            titles: this.tiles.map(t => t.toJson())
        });
    }
}
//# sourceMappingURL=worldgen.js.map