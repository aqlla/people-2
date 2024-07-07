import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { groupFaces, toJson } from './goldberg';
import { saveAs } from 'file-saver';

const sizes = [
	2, 5, 8, 11, 14, 17, 23, 29, 32, 35, 44, 56, 68
]

const SUBDIVISIONS = 14
const radius = 25
const distance = 25 + 100 / SUBDIVISIONS
const FOV = 30;

const SCALE = 1;
const WIREFRAME = false
const FLAT_SHADING = false
const OUTLINES = true

const moveSpeed = 0.1;
const rotationSpeed = 0.002;

const height = window.innerHeight;
const width = window.innerWidth;

// Initialize the Three.js Scene
const scene = new THREE.Scene();
scene.scale.setScalar(SCALE);
scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 1000);
const pivot = new THREE.Object3D()
const Y_AXIS = new THREE.Vector3(0, 1, 0);
const X_AXIS = new THREE.Vector3(1, 0, 0);
scene.add(pivot);
pivot.add(camera);
camera.lookAt(pivot.position);
camera.position.set(0, 0, radius + distance);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.1;
controls.enablePan = false
controls.enableRotate = true
controls.enableZoom = true;
controls.zoomSpeed  = 0.075
controls.minDistance = radius + 0.1
controls.minPolarAngle = Math.PI/2;
controls.maxPolarAngle = Math.PI/2;

// Basic Lighting
const ambientLight = new THREE.AmbientLight(0xcccccc, 1.25);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1.25);
pointLight.position.set(50, 200, 10);
pointLight.castShadow = true
scene.add(pointLight);

// Adding a plane to receive shadows
const plane = new THREE.Mesh(
	new THREE.PlaneGeometry(200, 200), 
	new THREE.MeshStandardMaterial({ color: 0x888888 }));
plane.rotation.x = -Math.PI / 2;
plane.position.y = -(radius + 1);
plane.receiveShadow = true;
scene.add(plane);

const getColor = (base, facet) => {
	const addend = 15 * facet
	return base + (addend << 8)
}

const normalize = (radius, vector) =>
	vector.clone().normalize().multiplyScalar(radius);

const randIntRange = (min, max) =>
	Math.random() * (max - min) + min

const sumVec3 = (acc, vec3) => acc.add(vec3)
const getCoplanarCenter = verts => 
	verts.reduce(sumVec3, new THREE.Vector3())
		.divideScalar(verts.length);

const makeEdgeGeometry = geo => new THREE.LineSegments(
	new THREE.EdgesGeometry(geo), 
	new THREE.LineBasicMaterial({ color: 0x080808 }));

const makeTileMesh = tile => {
	const verts = tile.vertices
	const geo = new ConvexGeometry(verts)
	geo.computeFlatVertexNormals()
	geo.castShadow = true
	geo.receiveShadow = true
	return geo
}


const raycaster = new THREE.Raycaster();
const pointer = new THREE.Vector2();

const onPointerMove = (event) => {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// WASD controls
const keys = { w: false, a: false, s: false, d: false };
let prevIntersects = []
let prevSelected = null

const onclick = (event) => {
	if (!!prevSelected) {
		console.log(tileMap.get(prevSelected))
	}
}

// Render the Scene
const animate = () => {
    if (keys.a) pivot.rotateOnAxis(Y_AXIS, -rotationSpeed)
    if (keys.d) pivot.rotateOnAxis(Y_AXIS, rotationSpeed)
	if (keys.w) pivot.rotateOnAxis(X_AXIS, -rotationSpeed)
	if (keys.s) pivot.rotateOnAxis(X_AXIS, rotationSpeed)

    controls.update();

	// update the picking ray with the camera and pointer position
	// raycaster.setFromCamera(pointer, camera);

	// // calculate objects intersecting the picking ray
	// const intersects = raycaster.intersectObjects(scene.children);
	// if (tileMap) {
	// 	prevIntersects.forEach(i => {
	// 		if (tileMap.has(i.object.uuid)) {
	// 			i.object.material.color.set(tileMap.get(i.object.uuid).color)
	// 		}
	// 	})

	// 	for (let i = 0; i < intersects.length; i ++) {
	// 		const uuid = intersects[i].object.uuid
	// 		if (tileMap.has(uuid)) {
	// 			if (uuid !== prevSelected) {
	// 				prevSelected = uuid
	// 			}
	// 			intersects[i].object.material.color.set(0xff0000);
	// 		}
	// 	}
	// }
	// prevIntersects = intersects

    renderer.render(scene, camera);
	// camera.updateProjectionMatrix()
    requestAnimationFrame(animate);
};

const generateWorld = (n, r) => {
	const ico = new THREE.IcosahedronGeometry(r, n);
	const tiles = groupFaces(ico, r);

	const blob = new Blob([toJson(tiles)], { type: 'application/json' })
	saveAs(blob, `goldberg_${n}_${r}.json`)

	return tiles
}

const tileMap = new Map();


const run = (tiles) => {
	tiles.forEach(tile => {
		const geo = makeTileMesh(tile)
		const color = (tile.vertices.length === 5) ? 0xff0000 : getColor(0x330033, tile.facet)
		const material = new THREE.MeshStandardMaterial({
			color,
			flatShading: FLAT_SHADING,
			wireframe: WIREFRAME,
		});
	
		const mesh = new THREE.Mesh(geo, material);
		tileMap.set(mesh.uuid, { 
			tile,
			color
		})
		mesh.castShadow = true
		scene.add(mesh);
	
		if (OUTLINES) {
			scene.add(makeEdgeGeometry(geo))
		}
	})
	
	window['tiles'] = tileMap
	animate();
}

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        controls.autoRotate = !controls.autoRotate
    }
    keys[event.key.toLowerCase()] = true;
});

document.addEventListener('keyup', (event) => {
    keys[event.key.toLowerCase()] = false;
});

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

window.addEventListener('click', onclick)
window.addEventListener('pointermove', onPointerMove);


fetch(`/dist/goldberg_${SUBDIVISIONS}_${radius}.json`)
	.then(res => {
		console.log(`found JSON file for goldberg ${SUBDIVISIONS}-${radius}`)
		return res.json()
	})
	.then(data => data.map(({ center, vertices, facet }) => ({ 
		facet,
		center,
		vertices: vertices.map(v => new THREE.Vector3(...v)) 
	})))
	.catch(() => {
		console.log(`Generating goldberg...`)
		return generateWorld(SUBDIVISIONS, radius)
	})
	.then(tiles => run(tiles))
	.catch(error => console.log(error))