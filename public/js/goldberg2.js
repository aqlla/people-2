import * as THREE from 'three';

// Function to project a vertex onto a sphere
const projectToSphere = (r) => (vert) => vert.clone().normalize().multiplyScalar(r);

// Function to find the center of a polygon
function findCenter(vertices) {
    const center = new THREE.Vector3();
    vertices.forEach(vertex => center.add(vertex));
    center.divideScalar(vertices.length);
    return center;
}

// Function to adjust the center to be coplanar with vertices
function adjustCenterToPlane(vertices, center) {
    const normal = new THREE.Vector3();
    normal.crossVectors(vertices[1].clone().sub(vertices[0]), vertices[2].clone().sub(vertices[0])).normalize();
    const projection = normal.clone().multiplyScalar(normal.dot(center.clone().sub(vertices[0])));
    return center.clone().sub(projection);
}

// Main function to create and adjust Goldberg polyhedron
export function createGoldbergPolyhedron(radius, nDivisions) {
    const geometry = new THREE.IcosahedronGeometry(radius, nDivisions);
    const newVerts = geometry.vertices.map(projectToSphere(radius));
    const tiles = [];

    // Create a map of edges to faces
    const edgeMap = new Map();

    // Populate edge map and identify hexagons/pentagons
    geometry.faces.forEach((face, faceIndex) => {
        const indices = [face.a, face.b, face.c];
        indices.forEach((index, i) => {
            const nextIndex = indices[(i + 1) % 3];
            const key = index < nextIndex ? `${index}-${nextIndex}` : `${nextIndex}-${index}`;
            if (!edgeMap.has(key)) {
                edgeMap.set(key, []);
            }
            edgeMap.get(key).push(faceIndex);
        });
    });

    // Identify hexagons and pentagons by adjacency
    const faceAdjacency = new Map();

    geometry.faces.forEach((face, faceIndex) => {
        const indices = [face.a, face.b, face.c];
        const adjacentFaces = new Set();
        indices.forEach((index, i) => {
            const nextIndex = indices[(i + 1) % 3];
            const key = index < nextIndex ? `${index}-${nextIndex}` : `${nextIndex}-${index}`;
            edgeMap.get(key).forEach(adjFaceIndex => {
                if (adjFaceIndex !== faceIndex) {
                    adjacentFaces.add(adjFaceIndex);
                }
            });
        });
        faceAdjacency.set(faceIndex, Array.from(adjacentFaces));
    });

    faceAdjacency.forEach((adjFaces, faceIndex) => {
        const face = geometry.faces[faceIndex].clone();
        const indices = [face.a, face.b, face.c];
        const vertices = indices.map(index => newVerts[index]);
        const center = findCenter(vertices);
        const adjustedCenter = adjustCenterToPlane(vertices, center);
        const faceCount = adjFaces.length + 1;

        tiles.push({
            verts: vertices,
            faces: [face],
            center: adjustedCenter,
            type: faceCount === 5 ? 'pentagon' : 'hexagon'
        });
    });

    return tiles;
}

// // Example usage
// const radius = 10;
// const nDivisions = 3;

// const goldbergTiles = createGoldbergPolyhedron(radius, nDivisions);

// // Rendering the tiles
// const scene = new THREE.Scene();
// const material = new THREE.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });

// goldbergTiles.forEach(tile => {
//     const tileGeometry = new THREE.Geometry();
//     tile.verts.forEach(vertex => {
//         tileGeometry.vertices.push(vertex);
//     });
//     tile.faces.forEach(face => {
//         tileGeometry.faces.push(face);
//     });

//     const mesh = new THREE.Mesh(tileGeometry, material);
//     scene.add(mesh);
// });

// // Set up camera and renderer
// const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
// camera.position.z = 20;

// const renderer = new THREE.WebGLRenderer();
// renderer.setSize(window.innerWidth, window.innerHeight);
// document.body.appendChild(renderer.domElement);

// // Render loop
// function animate() {
//     requestAnimationFrame(animate);
//     renderer.render(scene, camera);
// }
// animate();
