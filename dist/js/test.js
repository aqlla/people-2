let _faceCount = 0;

const Face = function(point1, point2, point3, register = true) {
	this.id = _faceCount++;

	this.points = [
		point1,
		point2,
		point3
	];

	if(register){
		point1.registerFace(this);
		point2.registerFace(this);
		point3.registerFace(this);
	}
};

Face.prototype = {

	getOtherPoints: function (p1) {
		return this.points.filter(p => p.toString() !== p1.toString())
	},

	findThirdPoint: function(point1, point2) {
		for(var i = 0; i < this.points.length; i++){
			if (!this.points[i].eq(point1) && !this.points[i].eq(point2)) {
				return this.points[i];
			}
		}
	},

	isAdjacentTo: function (face2) {
		// adjacent if 2 of the points are the same
		var count = 0;
		for (var i = 0; i< this.points.length; i++) {
			for (var j =0 ; j< face2.points.length; j++) {
				if (this.points[i].eq(face2.points[j])) {
					count++;
				}
			}
		}

		return (count == 2);
	},

	get centroid() {
		// if(this.centroid && !clear) return this.centroid;
		return this.centroid = new Point(
			(this.points[0].x + this.points[1].x + this.points[2].x)/3,
			(this.points[0].y + this.points[1].y + this.points[2].y)/3,
			(this.points[0].z + this.points[1].z + this.points[2].z)/3,
		);
	},

	eq: function (other) {
		return this.id === other.id
	}
};

const Hexasphere = function(radius, numDivisions, hexSize) {

	Hexasphere.radius = radius;
	var tao = 1.61803399;
	var corners = [
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

	var points = {};

	for(var i = 0; i< corners.length; i++){
		points[corners[i]] = corners[i];
	}

	var faces = [
		new Face(corners[0], corners[1], corners[4], false),
		new Face(corners[1], corners[9], corners[4], false),
		new Face(corners[4], corners[9], corners[5], false),
		new Face(corners[5], corners[9], corners[3], false),
		new Face(corners[2], corners[3], corners[7], false),
		new Face(corners[3], corners[2], corners[5], false),
		new Face(corners[7], corners[10], corners[2], false),
		new Face(corners[0], corners[8], corners[10], false),
		new Face(corners[0], corners[4], corners[8], false),
		new Face(corners[8], corners[2], corners[10], false),
		new Face(corners[8], corners[4], corners[5], false),
		new Face(corners[8], corners[5], corners[2], false),
		new Face(corners[1], corners[0], corners[6], false),
		new Face(corners[11], corners[1], corners[6], false),
		new Face(corners[3], corners[9], corners[11], false),
		new Face(corners[6], corners[10], corners[7], false),
		new Face(corners[3], corners[11], corners[7], false),
		new Face(corners[11], corners[6], corners[7], false),
		new Face(corners[6], corners[0], corners[10], false),
		new Face(corners[9], corners[1], corners[11], false)
	];

	var getPointIfExists = function(point){
		if(points[point]){
			return points[point];
		} else {
			points[point] = point;
			return point;
		}
	};


	var newFaces = [];

	for(var f = 0; f< faces.length; f++){
		var prev = null;
		var bottom = [faces[f].points[0]];
		var left =  faces[f].points[0].subdivide(faces[f].points[1], numDivisions, getPointIfExists);
		var right = faces[f].points[0].subdivide(faces[f].points[2], numDivisions, getPointIfExists);
		for(var i = 1; i<= numDivisions; i++){
			prev = bottom;
			bottom = left[i].subdivide(right[i], i, getPointIfExists);
			for(var j = 0; j< i; j++){
				var nf = new Face(prev[j], bottom[j], bottom[j+1]);
				newFaces.push(nf);

				if(j > 0){
					nf = new Face(prev[j-1], prev[j], bottom[j]);
					newFaces.push(nf);
				}
			}
		}
	}

	faces = newFaces;

	var newPoints = {};
	for(var p in points){
		var np = points[p].project(radius);
		newPoints[np] = np;
	}

	points = newPoints;

	this.tiles = [];
	this.tileLookup = {};

	// create tiles and store in a lookup for references
	for(var p in points){
		var newTile = new Tile(points[p], hexSize);
		this.tiles.push(newTile);
		this.tileLookup[newTile.toString()] = newTile;
	}

	// resolve neighbor references now that all have been created
	for(var t in this.tiles){
		this.tiles[t].neighbors = this.tiles[t].neighborIds.map(item => this.tileLookup[item]);
	}

};

Hexasphere.prototype = {
	toJson: function() {
		return JSON.stringify({
			radius: Hexasphere.radius,
			tiles: this.tiles.map(tile => tile.toJson())
		});
	}
}

const Point = function(x,y,z){
	if(x !== undefined && y !== undefined && z !== undefined){
		this.x = x.toFixed(3);
		this.y = y.toFixed(3);
		this.z = z.toFixed(3);
	}

	this.faces = [];
}

Point.prototype = {
	subdivide: function(point, count, checkPoint) {
		const segments = [this];

		for (var i = 1; i< count; i++) {
			segments.push(checkPoint(new Point(
				this.x * (1-(i/count)) + point.x * (i/count),
				this.y * (1-(i/count)) + point.y * (i/count),
				this.z * (1-(i/count)) + point.z * (i/count)
			)));
		}

		segments.push(point);
		return segments;
	},

	segment: function(point, percent) {
		percent = Math.max(0.01, Math.min(1, percent))
		return new Point(
			point.x * (1-percent) + this.x * percent,
			point.y * (1-percent) + this.y * percent,
			point.z * (1-percent) + this.z * percent)
	},

	midpoint: function(point) {
		return this.segment(point, .5);
	},

	project: function(radius = Hexasphere.radius, percent = 1.0) {
		percent = Math.max(0, Math.min(1, percent));
		const mag = Math.sqrt(Math.pow(this.x, 2) + Math.pow(this.y, 2) + Math.pow(this.z, 2));
		const ratio = radius / mag;

		this.x = this.x * ratio * percent;
		this.y = this.y * ratio * percent;
		this.z = this.z * ratio * percent;
		return this;
	},

	registerFace: function(face){
		this.faces.push(face);
	},

	getOrderedFaces: function() {
		var workingArray = this.faces.slice();
		var ret = [];

		var i = 0;
		while(i < this.faces.length){
			if(i == 0){
				ret.push(workingArray[i]);
				workingArray.splice(i,1);
			} else {
				var hit = false;
				var j = 0;
				while(j < workingArray.length && !hit){
					if(workingArray[j].isAdjacentTo(ret[i-1])){
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
	},

	findCommonFace: function(other, notThisFace) {
		for (var i = 0; i< this.faces.length; i++) {
			for (var j = 0; j< other.faces.length; j++) {
				if (this.faces[i].eq(other.faces[j]) && !this.faces[i].eq(notThisFace)) {
					return this.faces[i];
				}
			}
		}

		return null;
	},

	toJson: function() {
		return {
			x: this.x,
			y: this.y,
			z: this.z
		};
	},

	toString: function() {
		return '' + this.x + ',' + this.y + ',' + this.z;
	},

	eq: function (other) {
		return other.toString() === this.toString()
	}
}
function vector(p1, p2) {
	return {
		x: p2.x - p1.x,
		y: p2.y - p1.y,
		z: p2.z - p1.z
	}
}

// https://www.khronos.org/opengl/wiki/Calculating_a_Surface_Normal
// Set Vector U to (Triangle.p2 minus Triangle.p1)
// Set Vector V to (Triangle.p3 minus Triangle.p1)
// Set Normal.x to (multiply U.y by V.z) minus (multiply U.z by V.y)
// Set Normal.y to (multiply U.z by V.x) minus (multiply U.x by V.z)
// Set Normal.z to (multiply U.x by V.y) minus (multiply U.y by V.x)
function calculateSurfaceNormal(p1, p2, p3){
	const U = vector(p1, p2)
	const V = vector(p1, p3)
	return {
		x: U.y * V.z - U.z * V.y,
		y: U.z * V.x - U.x * V.z,
		z: U.x * V.y - U.y * V.x
	};
}

function pointingAwayFromOrigin(p, v){
	return ((p.x * v.x) >= 0) && ((p.y * v.y) >= 0) && ((p.z * v.z) >= 0)
}

const Tile = function(centerPoint, hexSize = 1) {
	hexSize = Math.max(.01, Math.min(1.0, hexSize));

	this.centerPoint = centerPoint;
	this.faces = centerPoint.getOrderedFaces();
	this.bounds = [];
	this.neighborIds = []; // this holds the centerpoints, will resolve to references after
	this.neighbors = []; // this is filled in after all the tiles have been created

	var neighborHash = {};
	for(var f=0; f< this.faces.length; f++){
		// build boundary
		this.bounds.push(this.faces[f].centroid.segment(this.center, hexSize));

		// get neighboring tiles
		var otherPoints = this.faces[f].getOtherPoints(this.center);
		for(var o = 0; o < 2; o++){
			neighborHash[otherPoints[o]] = 1;
		}

	}

	this.neighborIds = Object.keys(neighborHash);

	// Some of the faces are pointing in the wrong direction
	// Fix this.  Should be a better way of handling it
	// than flipping them around afterwards
	var normal = calculateSurfaceNormal(this.bounds[1], this.bounds[2], this.bounds[3]);

	if(!pointingAwayFromOrigin(this.center, normal)){
		this.bounds.reverse();
	}
};

Tile.prototype = {
	get coords() {
		var point = this.center;
		if(typeof boundaryNum == "number" && boundaryNum < this.bounds.length){
			point = this.bounds[boundaryNum];
		}

		var theta = (Math.atan2(point.x, point.z) + Math.PI + Math.PI / 2) % (Math.PI * 2) - Math.PI; // lon

		// theta is a hack, since I want to rotate by Math.PI/2 to start.  sorryyyyyyyyyyy
		return {
			lat: 180 * Math.acos(point.y / Hexasphere.radius) / Math.PI - 90,
			lon: 180 * theta / Math.PI
		};
	},



	scaledBoundary: function(scale) {
		scale = Math.max(0, Math.min(1, scale));

		var ret = [];
		for(var i = 0; i < this.bounds.length; i++){
			ret.push(this.center.segment(this.bounds[i], 1 - scale));
		}

		return ret;
	},

	toJson: function() {
		// this.centerPoint = centerPoint;
		// this.faces = centerPoint.getOrderedFaces();
		// this.boundary = [];
		return {
			centerPoint: this.centerPoint.toJson(),
			boundary: this.bounds.map(p => p.toJson())
		};

	},

	toString: function() {
		return this.center.toString();
	},
}