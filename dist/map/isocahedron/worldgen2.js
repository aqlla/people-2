import { clamp } from "../../lib/math.js";
const pull = (arr, index) => {
    const val = arr[index];
    arr.splice(index, 1);
    return val;
};
class Point {
    static idIncrementor = 0;
    id = ++Point.idIncrementor;
    faces = [];
    _str;
    _x;
    _y;
    _z;
    constructor(x, y, z) {
        if (x !== undefined && y !== undefined && z !== undefined) {
            this._x = x.toFixed(3);
            this._y = y.toFixed(3);
            this._z = z.toFixed(3);
        }
    }
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
        const mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
        const ratio = radius / mag;
        return new Point(this.x * ratio * pct, this.y * ratio * pct, this.z * ratio * pct);
        // return new Point(
        // 	this.components[0] = this.x * ratio * pct,
        // 	this.components[1] = this.y * ratio * pct,
        // 	this.components[2] = this.z * ratio * pct)
    }
    addFace(face) {
        return this.faces.push(face);
    }
    get orderedFaces() {
        const workingArr = this.faces.slice();
        const ret = [];
        console.log(this.faces);
        let i = 0;
        while (i < this.faces.length) {
            if (i === 0) {
                ret.push(workingArr[i]);
                workingArr.splice(i, 1);
            }
            else {
                let hit = false;
                let j = 0;
                console.log(`i: ${i}`);
                while (j < workingArr.length && !hit) {
                    console.log(`j: ${j}`);
                    if (workingArr[j].isAdjacentTo(ret[i - 1])) {
                        console.log('hit');
                        console.log(ret);
                        hit = true;
                        ret.push(workingArr[j]);
                        workingArr.splice(j, 1);
                        // ret.push(pull(workingArr, j))
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
                if (this.faces[i].id === other.faces[j].id && notThisFace.id !== this.faces[i].id) {
                    return this.faces[i];
                }
            }
        }
        return null;
    }
    get x() { return this._x; }
    get y() { return this._y; }
    get z() { return this._z; }
    eq(other) {
        return this.toString() === other.toString();
    }
    toString() {
        if (this._str === undefined) {
            this._str = '' + this.x + ',' + this.y + ',' + this.z;
        }
        return this._str;
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
        this.points = points.slice();
        if (register) {
            this.points.forEach(p => p.addFace(this));
        }
    }
    getOtherPoints(point) {
        let others = [];
        for (let i = 0; i < this.points.length; i++) {
            if (!point.eq(this.points[i])) {
                others.push(this.points[i]);
            }
        }
        return others;
    }
    findThirdPoint(p1, p2) {
        for (var i = 0; i < this.points.length; i++) {
            if (this.points[i].toString() !== p1.toString() && this.points[i].toString() !== p2.toString()) {
                return this.points[i];
            }
        }
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
        // if (!other) { return false }
        for (let i = 0; i < this.points.length; i++) {
            for (let j = 0; j < other.points.length; j++) {
                if (this.points[i].toString() == other.points[j].toString()) {
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
function vector(p1, p2) {
    return {
        x: p2.x - p1.x,
        y: p2.y - p1.y,
        z: p2.z - p1.z
    };
}
// https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
const surfaceNormal = (p1, p2, p3) => {
    // console.log(p1, p2, p3)
    const U = vector(p1, p2);
    const V = vector(p1, p3);
    return {
        x: U.y * V.z - U.z * V.y,
        y: U.z * V.x - U.x * V.z,
        z: U.x * V.y - U.y * V.x
    };
};
const pointingAwayFromOrigin = (p, v) => ((p.x * v.x) >= 0) && ((p.y * v.y) >= 0) && ((p.z * v.z) >= 0);
export class Tile {
    static idIncrementor = 0;
    id = ++Tile.idIncrementor;
    mesh;
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
        console.log('center:');
        console.log(center);
        console.log(this.faces);
        const neighHash = {};
        for (let i = 0; i < this.faces.length; i++) {
            console.log(`i: ${i}`);
            console.log('centroud');
            console.log(this.faces[i].centroid);
            this.bounds.push(this.faces[i].centroid.segment(this.center, size));
            const others = this.faces[i].getOtherPoints(this.center);
            console.log(this.faces[i].points);
            for (let j = 0; j < 2; j++) {
                console.log(`j: ${j}`);
                neighHash[others[j].toString()] = 1;
            }
        }
        this.neighborIds = Object.keys(neighHash);
        console.log('bounds:');
        console.log(this.bounds);
        const normal = surfaceNormal(this.bounds[0], this.bounds[1], this.bounds[2]);
        if (!pointingAwayFromOrigin(this.center, normal)) {
            this.bounds.reverse();
        }
    }
    getCoords(radius, boundaryNum = null) {
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
    eq(other) {
        return this.center.toString() === other.center.toString();
    }
}
export class Grid {
    radius;
    hexSize;
    nDivisions;
    tileMap = {};
    tiles = [];
    faces = [];
    points = {};
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
            points[corners[i].toString()] = corners[i];
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
        // console.log(faces)
        const getPointsIfExist = (point) => {
            const str = point.toString();
            if (!points[str]) {
                points[str] = point;
            }
            return points[str];
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
        console.log(newFaces);
        this.faces = faces;
        for (const p of Object.values(points)) {
            const np = p.projection(radius);
            this.points[np.toString()] = np;
        }
        console.log(this.points);
        // create tiles and store in a lookup for references
        for (const [k, p] of Object.entries(this.points)) {
            console.log(k);
            console.log(p);
            const nt = new Tile(p, hexSize);
            this.tiles.push(nt);
            this.tileMap[nt.center.toString()] = nt;
        }
        // resolve neighbor references now that all have been created
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
//# sourceMappingURL=worldgen2.js.map