const tao = 1.618033988749895;

const ISO_VERTS = [
    // z-orthogonal (vertical)
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
]

const ISO_FACES = [
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
]


const cache = {}

const checkCache = (key, value) => (cache[key] !== undefined) ?
    cache[key] : (cache[key] = value)

const vec3key = ([x, y, z]) =>
    `${x.toFixed(3)},${y.toFixed(3)},${z.toFixed(3)}`

const range = (min, max) => {
    return [...Array(max - min).keys()]
        .map(n => n + min)
}


/**
 * Linearly interpolates between two points.
 * @param {number[]} a - The starting point [x, y, z].
 * @param {number[]} b - The ending point [x, y, z].
 * @param {number} t - The interpolation factor (0 <= t <= 1).
 * @returns {number[]} The interpolated point [x, y, z].
 */
const linearInterpolation = (a, b, t) => {
    console.log('a: ', a)
    return [
        a[0] * (1 - t) + b[0] * t,
        a[1] * (1 - t) + b[1] * t,
        a[2] * (1 - t) + b[2] * t
    ]
}







const applyLerp = (a, b, div) =>
    n => {
        console.log('n: ' + n)
        return linearInterpolation(a, b, n * (1 / (div + 1)))
    }

const subdivideEdge = (verts, a, b, div) => {
    // const mids = []
    // const tDiv = (1 / (div + 1))
    //
    // for (let i= 1; i <= div; i++) {
    //     mids.push(linearInterpolation(verts[a], verts[b], i * tDiv))
    // }

    return [
        verts[a],
        // ...mids,
        ...(range(1, div).map(applyLerp(verts[a], verts[b], div))),
        verts[b],
    ]
}


/* https://en.wikipedia.org/wiki/Geodesic_polyhedron */
const subdivideTriangle2 = (verts, num) => ([a, b, c]) => {
    console.log([a, b, c])
    const cache = {}
    const ab = subdivideEdge(verts, a, b, num, cache)
    const ac = subdivideEdge(verts, a, c, num, cache)

    // init new faces arr with the first divided triangle
    const faces = [
        [ a, ab[1], ac[1] ]]


    // First row of new tris
    let top = [ ab[1], ac[1] ]

    //Create triangles one row at a time
    for (let d = 1; d <= num; d++) {
        //Determine the bottom verts for the row
        console.log('d: ' + d)
        console.log(ab)
        console.log(ac)
        const bc = subdivideEdge(verts, ab[d][0], ac[d][0], d, cache);

        let tMax = top.length - 1;

        //Using the top line as the iterator to connect to the bottom line.
        //Build two triangles at a time, as long as there is enough verts for the second one.
        for (let t = 0; t <= tMax; t++) {
            faces.push([ top[t], bc[t], bc[t + 1] ]);

            if (t < tMax) {
                faces.push([ top[t], bc[t + 1], top[t + 1] ])
            }
        }

        top	= bc
    }

    return faces
}

const subdivideFaces = faces =>
    faces.flatMap(subdivideTriangle2(ISO_VERTS, 10))
        .map((sub, i) => checkCache(vec3key(sub), i))
