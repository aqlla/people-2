Array.prototype.each = function(fn, thisArg) {
    const _this = thisArg || this
    _this.forEach(fn)
    return _this
}

Array.prototype.distinct = function() { return uniq(this) }


Array.prototype.findPop = function(fn) {
    const foundIndex = this.findIndex(fn)
    let found = undefined
    if (foundIndex > -1) {
        found = this[foundIndex]
        this.splice(foundIndex, 1)
    }
    return found 
}

export const projectToSphere = (geometry, radius) => {
    geometry.vertices.forEach(vertex =>
        vertex.normalize().multiplyScalar(radius))
    geometry.verticesNeedUpdate = true;
}

const isEmpty = arr => arr.length === 0

const not = fn => (...args) => !fn(...args)

const uniq = xs => [...new Set(xs)]

const vecToArr3 = ({x, y, z}) => [x, y, z]
const hasVertIndex = (i, { a, b, c }) => a === i || b === i || c === i

const getFacesWithCommonVertex = faces => i => 
	faces.filter(f => hasVertIndex(i, f))

// Returns array of edge endpoint indices from THREE.Vector3
const getEdges = ({ a, b, c }) => [ [ a, b ], [ b, c ], [ c, a ] ]

const getVerts = ({ a, b, c }) => [a, b, c]

// Apex of triangle: the point opposite the base
const getApex = base => ({ a, b, c }) => 
    [a, b, c].find(v => v !== base[0] && v !== base[1])

const getBase = apex => ({ a, b, c }) => 
    [a, b, c].find(v => v !== apex)

const vertHasNumAdjacentFaces = (n, faces) => i => 
    getFacesWithCommonVertex(faces)(i).length === n

const faceHasEdge = (edge, face) => 
        hasVertIndex(edge[0], face) && hasVertIndex(edge[1], face)

const findNextFace = ([center, searchVert], searchFaces) => {
    if (searchFaces.length === 0) return []

    // Find hex face with with shared edge
    const next = searchFaces
        .findPop(f => getEdges(f).some(e => e.includes(searchVert)))

    // Get next finding vert
    const newSearchVert = getVerts(next)
        .find(e => e !== searchVert && e !== center)

    return [next, ...findNextFace([center, newSearchVert], searchFaces)]
}


const getAdjacentHex = (geo, oldCenter, cache, facet) => (commonEdge) => {
    const adjFace = geo.faces
        // Get faces with edge, filter out face having `oldCenter` vert, as that is the
        // old one which we got the `commonEdge` from.
        .find(f => !cache.has(f) && faceHasEdge(commonEdge, f) && !getVerts(f).includes(oldCenter))

    if (!adjFace) { return [] }

    // Get center of the new hex.
    const center = getApex(commonEdge)(adjFace)

    // Get other faces which share the new center
    const hexFaces = geo.faces
        .filter(f => hasVertIndex(center, f))
        .each(f => cache.add(f))

    const verts = hexFaces
        .flatMap(({a, b, c}) => [a, b, c])
        .distinct()
        .filter(v => v !== center)

    return { 
        center: center, 
        faces: hexFaces,
        verts: verts,
        facet,
        vertices: verts.map(v => geo.vertices[v]),
        centroid: geo.vertices[center]
    }
}

// const getAdjacentOrderedHex = (geo, oldCenter, cache, depth) => (commonEdge) => {
//     const adjFace = geo.faces
//         // Get faces with edge, filter out face having `oldCenter` vert, as that is the
//         // old one which we got the `commonEdge` from.
//         .find(f => !cache.has(f) && faceHasEdge(commonEdge, f) && !getVerts(f).includes(oldCenter))

//     if (!adjFace) {
//         // console.log()
//         return undefined
//     }

//     // Get center of the new hex.
//     const center = getApex(commonEdge)(adjFace)

//     // Get other faces which share the new center
//     const hexFaces = geo.faces
//         .filter(f => f !== adjFace && hasVertIndex(center, f))

//     // cache.add(adjFace)
//     // Recursively find other faces
//     const ordered = [adjFace]
//         // Recursively find the next adjacent face until we have all 6 in order
//         .concat(findNextFace([center, commonEdge[0]], hexFaces))
//         // Add faces to the cache
//         .each(f => cache.add(f))
    
//     const verts = ordered
//         .flatMap(({a, b, c}) => [a, b, c])
//         .distinct()
//         .filter(v => v !== center)

//     return { 
//         center: center, 
//         faces: ordered,
//         verts: verts,
//         vertices: verts.map(v => geo.vertices[v]),
//         centroid: geo.vertices[center]
//     }
// }

const getTileFromCenter = (geo, cache) => (center, i) => {
    const faces = geo.faces
        .filter(f => !cache.has(f) && hasVertIndex(center, f))
        .each(f => cache.add(f))

    const verts = faces
        .flatMap(({a, b, c}) => [a, b, c])
        .distinct()
        .filter(v => v !== center)

    return { 
        center, 
        faces, verts, 
        facet: i,
        vertices: verts.map(v => geo.vertices[v]),
        centroid: geo.vertices[center] 
    }
}

const getHexesAroundTile = (geo, cache, limits, tile) => {
    if (cache.length === geo.faces.length) return []
    const { center, faces, facet } = tile
    const searchFaces = limits 
        ? faces.slice(limits[0], limits[1] + 1) 
        : faces
    
    const immediateHexes = searchFaces
        // .filter(f => cache.has(f))
        // Get face edge opposite the center vert
        .map(face => {
            const commonEdge = getVerts(face).filter(v => v !== center)
            return getAdjacentHex(geo, center, cache, facet)(commonEdge)
        })

    const hexes = []
    // Using imperative loop because I ran into call stack limits 
    for (const h of immediateHexes.flat()) {
        hexes.push(...getHexesAroundTile(geo, cache, [2, 4], h))
    }
    return [tile, ...hexes]
}

const normalize = (radius, vector) =>
	vector.clone().normalize().multiplyScalar(radius);


// Function to group faces into pentagons and hexagons
export const groupFaces = (geo, radius) => {
	const cache = new Set();
	const pentagons = geo.vertices
		.keys().toArray()
		.filter(vertHasNumAdjacentFaces(5, geo.faces))
		.map(getTileFromCenter(geo, cache))

    return pentagons
        .flatMap(p => getHexesAroundTile(geo, cache, undefined, p))
}

export const toJson = (tiles) => {
    return JSON.stringify(tiles.map(t => ({
        facet: t.facet,
        center: t.center,
        centroid: t.centroid,
        vertices: t.vertices.map(vecToArr3),
    })))
}


export const fromJson = () => {

}