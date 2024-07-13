import * as THREE from 'three';
import { ConvexGeometry } from 'three/examples/jsm/geometries/ConvexGeometry.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import { groupFaces, toJson } from './goldberg';
import { saveAs } from 'file-saver';

const sizes = [
	2, 5, 8, 11, 14, 17, 23, 29, 32, 35, 44, 56, 68, 89
]

const SUBDIVISIONS = 89
const radius = 25
const distance = 50 + 100 / SUBDIVISIONS
const FOV = 15;

const SCALE = 1;
const atmosphere_scale = 1.218
const WIREFRAME = false
const FLAT_SHADING = false
// const FLAT_TILES = true
const OUTLINES = false
const FLOOR = false

const moveSpeed = .05;
const rotationSpeed = 2;
const zoomSpeed = .5;

const height = window.innerHeight;
const width = window.innerWidth;

// Initialize the Three.js Scene
const scene = new THREE.Scene();
scene.scale.setScalar(SCALE);
scene.add(new THREE.AxesHelper(5));

const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 1000);
const pivot = new THREE.Object3D()
const X_AXIS = new THREE.Vector3(1, 0, 0);
const Y_AXIS = new THREE.Vector3(0, 0, 1);
scene.add(pivot);
pivot.add(camera);
camera.lookAt(pivot.position);
camera.position.set(radius + distance, 30, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.02;
controls.enablePan = false
controls.enableRotate = true
controls.rotateSpeed = rotationSpeed
controls.autoRotateSpeed = rotationSpeed
controls.enableZoom = true;
controls.zoomSpeed  = zoomSpeed
controls.minDistance = radius + 0.1
// controls.minPolarAngle = Math.PI/2;
// controls.maxPolarAngle = Math.PI/2;

// Basic Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 1.5);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 1);
pointLight.position.set(0, 0, 500);
pointLight.castShadow = true
scene.add(pointLight);

// Adding a plane to receive shadows
if (FLOOR) {
	const plane = new THREE.Mesh(
		new THREE.PlaneGeometry(200, 200), 
		new THREE.MeshStandardMaterial({ color: 0x888888 }));
	plane.rotation.x = -Math.PI / 2;
	plane.position.y = -(radius + 1);
	plane.receiveShadow = true;
	scene.add(plane);
}

const getColor = (base, facet) => {
	const addend = 15 * facet
	return base + (addend << 8)
}

const randIntRange = (min, max) =>
	Math.random() * (max - min) + min

const sumVec3 = (acc, vec3) => acc.add(vec3)
const getCoplanarCenter = verts => 
	verts.reduce(sumVec3, new THREE.Vector3())
		.divideScalar(verts.length);

const makeEdgeGeometry = geo => new THREE.LineSegments(
	new THREE.EdgesGeometry(geo), 
	new THREE.LineBasicMaterial({ color: 0x080808 }));

const cartesianToSpherical = ({ x, y, z }) => {
	const r = Math.sqrt(x * x + y * y + z * z);
    const theta = Math.acos(z / r);
    const phi = Math.atan2(y, x);
    return { r, theta, phi };
}

const sphericalToCartesian = ({ r, theta, phi }) => {
	const x = r * Math.sin(theta) * Math.cos(phi);
    const y = r * Math.sin(theta) * Math.sin(phi);
    const z = r * Math.cos(theta);
    return { x, y, z };
}

const cartesianToLatLon = ({ x, y, z }) => {
    const r = Math.sqrt(x * x + y * y + z * z);
    const lat = Math.asin(z / r);
    const lon = Math.atan2(y, x);
    return { lat, lon };
}

const setVertexHeight = (height) => (vert) => {
	const spherical = cartesianToSpherical(vert);
	spherical.r += height
	const { x, y, z } = sphericalToCartesian(spherical)
	return new THREE.Vector3(x, y, z)
}

const shrinkVert = (centroid, factor) => (vertex) => {
	const direction = new THREE.Vector3().subVectors(centroid, vertex).normalize();
	return new THREE.Vector3().addVectors(vertex, direction.multiplyScalar(factor));
}

const createFresnelMaterial = ({rimHex = 0x0088ff, facingHex = 0x000000} = {}) => {
	const uniforms = {
		color1: { value: new THREE.Color(rimHex) },
		color2: { value: new THREE.Color(facingHex) },
		fresnelBias: { value: 0.1 },
		fresnelScale: { value: 1.0 },
		fresnelPower: { value: 4.0 },
	};

	const vs = `
		uniform float fresnelBias;
		uniform float fresnelScale;
		uniform float fresnelPower;
		
		varying float vReflectionFactor;
		
		void main() {
		  vec4 mvPosition = modelViewMatrix * vec4( position, 1.0 );
		  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );
		
		  vec3 worldNormal = normalize( mat3( modelMatrix[0].xyz, modelMatrix[1].xyz, modelMatrix[2].xyz ) * normal );
		
		  vec3 I = worldPosition.xyz - cameraPosition;
		
		  vReflectionFactor = fresnelBias + fresnelScale * pow( 1.0 + dot( normalize( I ), worldNormal ), fresnelPower );
		
		  gl_Position = projectionMatrix * mvPosition;
		}`

	const fs = `
		uniform vec3 color1;
		uniform vec3 color2;
		
		varying float vReflectionFactor;
		
		void main() {
		  float f = clamp( vReflectionFactor, 0.0, 1.0 );
		  gl_FragColor = vec4(mix(color2, color1, vec3(f)), f);
		}`
		
	return new THREE.ShaderMaterial({
		uniforms: uniforms,
		vertexShader: vs,
		fragmentShader: fs,
		transparent: true,
		blending: THREE.AdditiveBlending,
	})
}


const raycaster = new THREE.Raycaster();
raycaster.layers.set(1)
const pointer = new THREE.Vector2();

const onPointerMove = (event) => {
	// calculate pointer position in normalized device coordinates
	// (-1 to +1) for both components
	pointer.x = ( event.clientX / window.innerWidth ) * 2 - 1;
	pointer.y = - ( event.clientY / window.innerHeight ) * 2 + 1;
}

// WASD controls
const keys = { w: false, a: false, s: false, d: false };
let prevIntersect = null
let prevSelected = null

const onclick = (event) => {
	if (!!prevSelected) {
		console.log(tileMap.get(prevSelected))
	}
}


// Render the Scene
const animate = () => {
    if (keys.a) pivot.rotateOnAxis(X_AXIS, -moveSpeed)
    if (keys.d) pivot.rotateOnAxis(X_AXIS, moveSpeed)
	if (keys.w) pivot.rotateOnAxis(Y_AXIS, moveSpeed)
	if (keys.s) pivot.rotateOnAxis(Y_AXIS, -moveSpeed)

    controls.update();
	// update the picking ray with the camera and pointer position
	// raycaster.setFromCamera(pointer, camera);

	// // calculate objects intersecting the picking ray
	// const intersects = raycaster.intersectObjects(scene.children)

	// if (tileMap && intersects.length) {
	// 	const prevVal = tileMap.get(prevIntersect?.object.uuid)
	// 	if (prevVal) {
	// 		prevIntersect.object.material.color.set(prevVal.color)
	// 	}

	// 	const uuid = intersects[0].object.uuid
	// 	if (tileMap.has(uuid)) {
	// 		if (uuid !== prevSelected) {
	// 			prevSelected = uuid
	// 		}
	// 		intersects[0].object.material.color.set(0xff0000)
	// 	}
	// 	prevIntersect = intersects[0]
	// }

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

const getEarthColor = ({ lat, lon }, ctx) => {
	// console.log(lat, lon)
    const u = 1 - (lon + Math.PI) / (2 * Math.PI);
    const v = (lat + Math.PI / 2) / Math.PI;
	// console.log(u, v)
    const x = Math.floor(u * ctx.canvas.width);
    const y = Math.floor(v * ctx.canvas.height);
    const pixel = ctx.getImageData(x, y, 1, 1).data;

	// return pixelData.data[(y * pixelWidth + x) * 4] === 0;
	const r = pixel[0];
	const g = pixel[1];
	const b = pixel[2];

    // Convert RGB to hex
    const hex = (r << 16) | (g << 8) | b;
    return hex;
}

const rotateGeometry = geo => {
	const rotMat1 = new THREE.Matrix4().makeRotationX(Math.PI / 2)
	// const rotMat2 = new THREE.Matrix4().makeRotationY(Math.PI)
	geo.applyMatrix4(rotMat1)
	// geo.applyMatrix4(rotMat2)
	geo.vertsNeedUpdate = true
	return geo
}

const makeTileGeometry = tile => {
	const height = 5; //Math.random() * 1.5

	const verts = tile.vertices
		.map(setVertexHeight(height))
		// .map(shrinkVert(tile.centroid, -1))

	const geo = rotateGeometry(new ConvexGeometry(verts))
	geo.computeFlatVertexNormals()
	geo.castShadow = true
	geo.receiveShadow = true
	return new THREE.BufferGeometry().fromGeometry(geo)
}


const run = (tiles) => {
	const img = document.getElementById("projection");
	const canvas = document.createElement('canvas')

	canvas.width = img.width;
    canvas.height = img.height;

    const ctx = canvas.getContext('2d', { willReadFrequently: true });
	ctx.drawImage(img, 0, 0, img.width, img.height)

	const earth = new THREE.Object3D()

	const geos = tiles.map(tile => {
		
		const geo = makeTileGeometry(tile)
		// const color = (tile.vertices.length === 5) ? 0xdd4444 : getColor(0x330033, tile.facet)
		const coord = cartesianToLatLon(tile.centroid)
		const color = getEarthColor(coord, ctx)
		const material = new THREE.MeshStandardMaterial({
			color,
			flatShading: FLAT_SHADING,
			wireframe: WIREFRAME,
		});
	
		const mesh = new THREE.Mesh(geo, material)
		tileMap.set(mesh.uuid, { tile, color })
		mesh.castShadow = true
		mesh.layers.enable(1)
		earth.add(mesh)
	
		if (OUTLINES) {
			earth.add(makeEdgeGeometry(geo))
		}

		return geo
	})

	// const geo2 = BufferGeometryUtils.mergeGeometries(geos, false)
	const geo2 = new THREE.SphereGeometry(radius, 80, 80); 
	const fresnelMat = createFresnelMaterial();
	const glowMesh = new THREE.Mesh(geo2, fresnelMat);
	glowMesh.scale.setScalar(atmosphere_scale);
	scene.add(glowMesh);

	// earth2.scale.setScalar(1.2)	


	scene.add(earth)
	// scene.add(earth2)
	
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


fetch(`/public/goldberg_${SUBDIVISIONS}_${radius}.json`)
	.then(res => {
		console.log(`found JSON file for goldberg ${SUBDIVISIONS}-${radius}`)
		return res.json()
	})
	.then(data => data.map(({ center, vertices, facet, centroid }) => ({ 
		facet,
		center,
		centroid,
		vertices: vertices.map(v => new THREE.Vector3(...v)) 
	})))
	.catch(() => {
		console.log(`Generating goldberg...`)
		return generateWorld(SUBDIVISIONS, radius)
	})
	.then(tiles => run(tiles))
	.catch(error => console.log(error))