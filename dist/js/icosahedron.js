const checkCache = (key, value) => (cache[key] !== undefined) ?
    cache[key] : (cache[key] = value)

const norm = ([ x, y, z ]) => Math.sqrt(x * x + y * y + z * z);

const add = ([x, y, z], [a, b, c]) => ([x + a, y + b, z + c])

const div = ([x, y, z], d) => ([x / d, y / d, z / d])


/**
 * Normalize a vector to lie on the unit sphere
 * @param {Array<number>} v - The vector to normalize
 * @returns {Array<number>} - The normalized vector
 */
const normalize = (v) => {
    const length = Math.sqrt(v[0] ** 2 + v[1] ** 2 + v[2] ** 2);
    return [v[0] / length, v[1] / length, v[2] / length];
};

/**
 * Initialize the vertices and faces of an icosahedron
 * @returns {Object} - An object containing the vertices and faces of the icosahedron
 */
const initializeIcosahedron = () => {
    const tao = (1.0 + Math.sqrt(5.0)) / 2.0;

    const vertices = [
        [ -1,  tao, 0 ],
        [  1,  tao, 0 ],
        [ -1, -tao, 0 ],
        [  1, -tao, 0 ],
    
        // x-orthogonal
        [ 0, -1,  tao ],
        [ 0,  1,  tao ],
        [ 0, -1, -tao ],
        [ 0,  1, -tao ],
    
        // y-orthogonal
        [  tao, 0, -1 ],
        [  tao, 0,  1 ],
        [ -tao, 0, -1 ],
        [ -tao, 0,  1 ],
    ].map(normalize);

    const faces = [
        [  0, 11,  5 ],
        [  0,  5,  1 ],
        [  0,  1,  7 ],
        [  0,  7, 10 ],
        [  0, 10, 11 ],
    
        [  1,  5,  9 ],
        [  5, 11,  4 ],
        [ 11, 10,  2 ],
        [ 10,  7,  6 ],
        [  7,  1,  8 ],
    
        [  3,  9,  4 ],
        [  3,  4,  2 ],
        [  3,  2,  6 ],
        [  3,  6,  8 ],
        [  3,  8,  9 ],
    
        [  4,  9,  5 ],
        [  2,  4, 11 ],
        [  6,  2, 10 ],
        [  8,  6,  7 ],
        [  9,  8,  1 ],
        // [0, 11, 5], [0, 5, 1], [0, 1, 7], [0, 7, 10], [0, 10, 11],
        // [1, 5, 9], [5, 11, 4], [11, 10, 2], [10, 7, 6], [7, 1, 8],
        // [3, 9, 4], [3, 4, 2], [3, 2, 6], [3, 6, 8], [3, 8, 9],
        // [4, 9, 5], [2, 4, 11], [6, 2, 10], [8, 6, 7], [9, 8, 1],
    ];

    return { vertices, faces };
};

/**
 * Calculate the midpoint and normalize it to the unit sphere
 * @param {Array<number>} a - The first vertex
 * @param {Array<number>} b - The second vertex
 * @returns {Array<number>} - The normalized midpoint
 */
const midpoint = (a, b) => normalize([(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2]);

/**
 * Subdivide each face of the icosahedron into smaller triangles
 * @param {Object} icosahedron - The initial icosahedron vertices and faces
 * @param {number} n - The subdivision frequency
 * @returns {Object} - The subdivided vertices and faces
 */
const subdivideIcosahedron = (icosahedron, n) => {
    const { vertices, faces } = icosahedron;
    let newVertices = [...vertices];
    let midCache = {};

    const getMidPointIndex = (v1, v2) => {
        const key = v1 < v2 ? `${v1}-${v2}` : `${v2}-${v1}`;
        if (midCache[key] !== undefined) return midCache[key];

        const mid = midpoint(newVertices[v1], newVertices[v2]);
        newVertices.push(mid);
        midCache[key] = newVertices.length - 1;
        return midCache[key];
    };

    let newFaces = [];

    faces.forEach(([a, b, c]) => {
        let ab = getMidPointIndex(a, b);
        let bc = getMidPointIndex(b, c);
        let ca = getMidPointIndex(c, a);

        newFaces.push([a, ab, ca]);
        newFaces.push([b, bc, ab]);
        newFaces.push([c, ca, bc]);
        newFaces.push([ab, bc, ca]);
    });

    for (let i = 0; i < n; i++) {
        let tempFaces = [];
        newFaces.forEach(face => {
            let [a, b, c] = face;

            let ab = getMidPointIndex(a, b);
            let bc = getMidPointIndex(b, c);
            let ca = getMidPointIndex(c, a);

            tempFaces.push([a, ab, ca]);
            tempFaces.push([b, bc, ab]);
            tempFaces.push([c, ca, bc]);
            tempFaces.push([ab, bc, ca]);
        });
        newFaces = tempFaces;
    }

    return { vertices: newVertices, faces: newFaces };
};

/**
 * Group triangles into hexagonal and pentagonal tiles
 * @param {Object} subdivided - The subdivided icosahedron vertices and faces
 * @returns {Array<Object>} - The tiles formed from the triangles
 */
const createTiles = (subdivided) => {
    const { _, faces } = subdivided;
    let vertexToFace = new Map();

    faces.forEach((face, i) => {
        face.forEach(v => {
            if (!vertexToFace.has(v)) {
                vertexToFace.set(v, []);
            }
            vertexToFace.get(v).push(i);
        });
    });

    let tiles = [];
    vertexToFace.forEach((faceIndices, vertex) => {
        if (faceIndices.length === 5 || faceIndices.length === 6) {
            const tile = { vertices: [], faces: [] };
            faceIndices.forEach(faceIndex => {
                faces[faceIndex].forEach(v => {
                    if (!tile.vertices.includes(v)) {
                        tile.vertices.push(v);
                    }
                });
                tile.faces.push(faceIndex);
            });
            tiles.push(tile);
        }
    });

    return tiles;
};

 /**
     * Sort vertices in a consistent order to form proper polygons
     * @param {Array<number>} vertices - Indices of vertices
     * @param {Array<Array<number>>} allVertices - All vertices of the polyhedron
     * @returns {Array<number>} - Sorted indices of vertices
     */
 const sortVertices = (vertices, allVertices) => {
    const center = calculateTileCenter(vertices, allVertices);
    return vertices.sort((a, b) => {
      const angleA = Math.atan2(allVertices[a][1] - center[1], allVertices[a][0] - center[0]);
      const angleB = Math.atan2(allVertices[b][1] - center[1], allVertices[b][0] - center[0]);
      return angleA - angleB;
    });
  };


/**
 * Converts Cartesian coordinates to spherical coordinates
 * @param {Array<number>} cartesian - The Cartesian coordinates [x, y, z]
 * @param {number} radius - The radius of the sphere
 * @returns {Array<number>} - The spherical coordinates [r, theta, phi]
 */
const cartesianToSpherical = (cartesian, radius) => {
    const [x, y, z] = cartesian;
    const r = radius;
    const theta = Math.acos(z / r); // polar angle
    const phi = Math.atan2(y, x);   // azimuthal angle
    return [r, theta, phi];
  };
  
  /**
   * Calculates the center point of a tile
   * @param {Array<number>} vertices - The vertices of the tile
   * @param {Array<Array<number>>} allVertices - All vertices of the polyhedron
   * @returns {Array<number>} - The center point of the tile
   */
  const calculateTileCenter = (vertices, allVertices) => {
    const center = vertices.reduce((acc, vertexIndex) => {
      const vertex = allVertices[vertexIndex];
      return [
        acc[0] + vertex[0],
        acc[1] + vertex[1],
        acc[2] + vertex[2]
      ];
    }, [0, 0, 0]);
  
    return normalize(center);
  };
  
  /**
   * Gets the spherical coordinates of the tile centerpoints
   * @param {Object} polyhedron - The polyhedron object containing vertices and tiles
   * @param {number} radius - The radius of the sphere
   * @returns {Array<Object>} - The spherical coordinates of the tile centerpoints
   */
  const getTileCenterpoints = (polyhedron, radius) => {
    const { vertices, tiles } = polyhedron;
  
    return tiles.map(tile => {
      const centerCartesian = calculateTileCenter(tile.vertices, vertices);
      const centerSpherical = cartesianToSpherical(centerCartesian, radius);
      return {
        cartesian: centerCartesian,
        spherical: centerSpherical
      };
    });
  };

  const setOrder = (m, faces, data) => {
    const dualFaces = [];
    let face = faces.pop();
    dualFaces.push(face);
    let index = data.faces[face].indexOf(m);
    index = (index + 2) % 3; //index to vertex included in adjacent face
    let v = data.faces[face][index];
    let f = 0;
    let vIndex = 0;
    while (faces.length > 0) {
        face = faces[f]
        if (data.faces[face].indexOf(v) > -1) { // v is a vertex of face f
            index = (data.faces[face].indexOf(v) + 1) % 3;
            v = data.faces[face][index];
            dualFaces.push(face);
            faces.splice(f, 1);
            f = 0;
        }
        else {
            f++
        }
    }
    return dualFaces; 
}

//convert geodesic to Goldberg by forming the dual
const GDtoGP = function(GDdata) {
    const GPdata = {};
    GPdata.vertices = [];
    GPdata.faces = [];
    verticesNb = GDdata.vertices.length;
    const map = new Array(verticesNb);
    for (let v = 0; v < verticesNb; v++) {
        map[v] = new Set();
    }
    for (let f = 0; f < GDdata.faces.length; f++) {
        for (let i = 0; i < 3; i++) {
            map[GDdata.faces[f][i]].add(f);
        }
    }
    let cx = 0;
    let cy = 0;
    let cz = 0;
    let face = [];
    let vertex = [];
    for(let m = 0; m < map.length; m++) {
        GPdata.faces[m] = setOrder(m, Array.from(map[m]), GDdata);
        map[m].forEach((el) => {
            cx = 0;
            cy = 0;
            cz = 0;
            face = GDdata.faces[el];
            for(let i = 0; i < 3; i++) {
                vertices = GDdata.vertices[face[i]];
                cx += vertices[0];
                cy += vertices[1];
                cz += vertices[2];
            }
            GPdata.vertices[el] = [cx / 3, cy / 3, cz / 3];  
        });
    }
    return GPdata;
};


/**
 * Create an icosahedral Goldberg polyhedron
 * @param {number} frequency - The subdivision frequency
 * @returns {Object} - The vertices, faces, and tiles of the polyhedron
 */
const createGoldbergPolyhedron = (n) => {
    let icosahedron = initializeIcosahedron();
    let subdivided = subdivideIcosahedron(icosahedron, n);
    let tiles = GDtoGP(subdivided);
    return { ...subdivided, tiles };
};
  
// Example usage
const polyhedron = createGoldbergPolyhedron(2); // Adjust frequency as needed
const radius = 1; // Example radius
// const tileCenterpoints = getTileCenterpoints(polyhedron, radius);

// console.log(tileCenterpoints);
  
  

Object.assign(window, {
    goldberg: createGoldbergPolyhedron
})