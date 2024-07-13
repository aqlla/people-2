
const TWO_PI = Math.PI * 2
const RAD_TO_DEG = 180 / Math.PI;

const toDegrees = radians =>
	radians * RAD_TO_DEG

const vector = (p1, p2) => ({
	x: p2.x - p1.x,
	y: p2.y - p1.y,
	z: p2.z - p1.z
})

const calculateSurfaceNormalVec = (v1, v2) => ({
	x: v1.y * v2.z - v1.z * v2.y,
	y: v1.z * v2.x - v1.x * v2.z,
	z: v1.x * v2.y - v1.y * v2.x })

const calculateSurfaceNormal = ([p1, p2, p3]) =>
	calculateSurfaceNormalVec(vector(p1, p2), vector(p1, p3))


class Face {
	static _idInc = 0;
	id = ++Face._idInc;
	_centroid = undefined;

	constructor(point1, point2, point3, register= true) {
		this.points = [ point1, point2, point3 ];

		if (register) {
			point1.registerFace(this);
			point2.registerFace(this);
			point3.registerFace(this);
		}
	}

	getOtherPoints(p1) {
		return this.points.filter(p => p.id !== p1.id)
	}

	isAdjacentTo(face2) {
		// adjacent if 2 of the points are the same
		let count = 0;
		for (let i = 0; i < this.points.length; i++) {
			for (let j =0 ; j < face2.points.length; j++) {
				if (this.points[i].id === face2.points[j].id) {
					count++;
				}
			}
		}

		return (count === 2);
	}

	get centroid() {
		return this._centroid || (this._centroid = new Point(
			(this.points[0].x + this.points[1].x + this.points[2].x)/3,
			(this.points[0].y + this.points[1].y + this.points[2].y)/3,
			(this.points[0].z + this.points[1].z + this.points[2].z)/3,
		));
	}

	eq(other) { return this.id === other.id }

	subdivide(num, checkFn) {
		let bottom = [this.points[0]];
		const ls = this.points[0].subdivide(this.points[1], num, checkFn);
		const rs = this.points[0].subdivide(this.points[2], num, checkFn);

		for (let i = 1; i <= num; i++) {
			const prev = bottom;
			bottom = ls[i].subdivide(rs[i], i, checkFn);
			for (let j = 0; j < i; j++) {
				new Face(prev[j], bottom[j], bottom[j+1]);
				if (j > 0) new Face(prev[j-1], prev[j], bottom[j]);
			}
		}
	}
}


class Point {
	faces = []
    _id = undefined

	constructor(x, y, z) {
		this.x = x.toFixed(3);
		this.y = y.toFixed(3);
		this.z = z.toFixed(3);
	}

	subdivide(point, count, checkPoint) {
		const segments = [this];

		for (let i = 1; i < count; i++) {
			segments.push(checkPoint(new Point(
				this.x * (1 - (i / count)) + point.x * (i / count),
				this.y * (1 - (i / count)) + point.y * (i / count),
				this.z * (1 - (i / count)) + point.z * (i / count)
			)));
		}

		segments.push(point);
		return segments;
	}

	segment(point, percent) {
		return new Point(
			point.x * (1-percent) + this.x * percent,
			point.y * (1-percent) + this.y * percent,
			point.z * (1-percent) + this.z * percent)
	}

	projection(radius = Geohex.radius, percent = 1.0) {
		const ratio = radius / Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
		return new Point(
			this.x * ratio * percent,
			this.y * ratio * percent,
			this.z * ratio * percent);
	}

	project(radius = Geohex.radius, percent = 1.0) {
		const ratio = radius / Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
		this.x = this.x * ratio * percent;
		this.y = this.y * ratio * percent;
		this.z = this.z * ratio * percent;
		return this;
	}

	registerFace(face){
		this.faces.push(face);
	}

	getOrderedFaces() {
		const workingArray = this.faces.slice();
		const ret = [];
		let i = 0;

		while (i < this.faces.length) {
			if (i === 0) {
				ret.push(workingArray[i]);
				workingArray.splice(i,1);
			} else {
				let hit = false;
				let j = 0;

				while (j < workingArray.length && !hit) {
					if (workingArray[j].isAdjacentTo(ret[i-1])) {
						hit = true;
						ret.push(workingArray[j]);
						workingArray.splice(j, 1);
					}
					j++;
				}
			}
			i++;
		}

		return ret;
	}

	toJson() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		};
	}

	toString() { return this.id }

	eq(other) { return other.id === this.id }

	get id() {
		return this._id || (this._id = '' + this.x + ',' + this.y + ',' + this.z)
	}
}

const getOtherPointIds = current =>
		face => face.points
			.filter(p => p.id !== current.id)
			.map(p => p.id)

class Tile {
	neighbors = [];
	_normal = undefined;

	constructor(center, hexSize = 1) {
		hexSize = Math.max(.01, Math.min(1.0, hexSize));
		this.center = center;
		this.faces = center.getOrderedFaces();
		this.bounds = this.faces.map(f => f.centroid.segment(this.center, hexSize));
		this.neighborIds = this.faces.flatMap(getOtherPointIds(this.center));

		// Some of the faces are pointing in the wrong direction, there should
		// be a better way of handling it than flipping them around afterwards
		if (this.isInverted) { this.flip() }
	}

	flip() {
		this.bounds.reverse()
	}

	get normal() {
		return this._normal || (this._normal = calculateSurfaceNormal(this.bounds));
	}

	get isInverted() {
		return !(((this.center.x * this.normal.x) >= 0)
			&& ((this.center.y * this.normal.y) >= 0)
			&& ((this.center.z * this.normal.z) >= 0))
	}

	get coords() {
		const theta = Math.atan2(this.center.x, this.center.z) % TWO_PI;
		const phi = Math.acos(this.center.y / Geohex.radius);
		return {
			lat: toDegrees(phi) - 90,
			lon: toDegrees(theta)
		};
	}

	toJson() {
		return {
			center: this.center.toJson(),
			bounds: this.bounds.map(p => p.toJson())
		};
	}

	toString() { return this.center.toString() }
}


class Geohex {
	constructor(radius, numDivisions, hexSize) {
		Geohex.radius = radius;
		const tao = 1.61803399;

		let verts = [
			new Point(1000, tao * 1000, 0),
			new Point(-1000, tao * 1000, 0),
			new Point(1000,-tao * 1000,0),
			new Point(-1000,-tao * 1000,0),
			new Point(0,1000,tao * 1000),
			new Point(0,-1000,tao * 1000),
			new Point(0,1000,-tao * 1000),
			new Point(0,-1000,-tao * 1000),
			new Point(tao * 1000,0,1000),
			new Point(-tao * 1000,0,1000),
			new Point(tao * 1000,0,-1000),
			new Point(-tao * 1000,0,-1000)
		];

		let points = verts.reduce((acc, v) =>
			Object.assign(acc, { [v.id]: v }), {});

		let faces = [
			new Face(verts[0], verts[1], verts[4], false),
			new Face(verts[1], verts[9], verts[4], false),
			new Face(verts[4], verts[9], verts[5], false),
			new Face(verts[5], verts[9], verts[3], false),
			new Face(verts[2], verts[3], verts[7], false),
			new Face(verts[3], verts[2], verts[5], false),
			new Face(verts[7], verts[10], verts[2], false),
			new Face(verts[0], verts[8], verts[10], false),
			new Face(verts[0], verts[4], verts[8], false),
			new Face(verts[8], verts[2], verts[10], false),
			new Face(verts[8], verts[4], verts[5], false),
			new Face(verts[8], verts[5], verts[2], false),
			new Face(verts[1], verts[0], verts[6], false),
			new Face(verts[11], verts[1], verts[6], false),
			new Face(verts[3], verts[9], verts[11], false),
			new Face(verts[6], verts[10], verts[7], false),
			new Face(verts[3], verts[11], verts[7], false),
			new Face(verts[11], verts[6], verts[7], false),
			new Face(verts[6], verts[0], verts[10], false),
			new Face(verts[9], verts[1], verts[11], false)
		];

		const addPoint = point => points[point] = point
		const getPointIfExists = point => points[point.id]
			? points[point.id] : points[point.id] = point

		faces.forEach(f =>
			f.subdivide(numDivisions, getPointIfExists))

		points = Object.values(points).reduce(
			(acc, p) => Object.assign(acc, { [p.id]: p.project() }), {})

		// this.tiles = [];
		const tileLookup = Object.values(points).reduce((acc, p) =>
			Object.assign(acc, { [p.id]: new Tile(p, hexSize) }), {});

		const lookupNeighbors = t =>
			t.neighbors = t.neighborIds.map(id => tileLookup[id])

		this.tiles = Object.values(tileLookup);
		this.tiles.forEach(lookupNeighbors);
	}

	toJson() {
		return {
			radius: Geohex.radius,
			tiles: this.tiles.map(t => t.toJson())
		}
	}
}
