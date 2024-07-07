import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';


const FOV = 50
const SCALE = 5

const SUBDIVISIONS = 10
const WIREFRAME = true

const moveSpeed = 0.1;
const rotationSpeed = 0.000001
let rotating = false;


const height = window.innerHeight
const width = window.innerWidth

// Initialize the Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(FOV, width / height, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

// Basic Lighting
const ambientLight = new THREE.AmbientLight(0x404040);
scene.add(ambientLight);

const pointLight = new THREE.PointLight(0xffffff, 0.5);
pointLight.position.set(-10, 10, 10);
pointLight.castShadow = true;
scene.add(pointLight);

// Adding a plane to receive shadows
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true;
scene.add(plane);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const { vertices, faces } = new THREE.IcosahedronGeometry(1, SUBDIVISIONS);

const geometry = new THREE.BufferGeometry();

const verticesArray = new Float32Array(vertices.length * 3);
vertices.forEach((vertex, i) => {
    verticesArray[i * 3] = vertex.x;
    verticesArray[i * 3 + 1] = vertex.y;
    verticesArray[i * 3 + 2] = vertex.z;
});

const facesArray = new Uint32Array(faces.length * 3);
faces.forEach((face, i) => {
    facesArray[i * 3] = face.a;
    facesArray[i * 3 + 1] = face.b;
    facesArray[i * 3 + 2] = face.c;
});

geometry.setAttribute('position', new THREE.BufferAttribute(verticesArray, 3));
geometry.setIndex(new THREE.BufferAttribute(facesArray, 1));
geometry.computeVertexNormals();

const material = new THREE.MeshPhongMaterial({ color: 0x0077ff, shininess: 10, wireframe: WIREFRAME });
const mesh = new THREE.Mesh(geometry, material);
mesh.castShadow = true;
mesh.receiveShadow = true;
scene.add(mesh);
scene.scale.setScalar(SCALE)

// Set camera position
camera.position.set(0, 5, 10);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

const moveCamera = () => {
    if (keys.w) camera.position.z -= moveSpeed;
    if (keys.s) camera.position.z += moveSpeed;
    if (keys.a) camera.position.x -= moveSpeed;
    if (keys.d) camera.position.x += moveSpeed;
};

// Render the Scene
const animate = () => {
    requestAnimationFrame(animate);

    moveCamera();
    controls.update();

    if (rotating) mesh.rotation.y += rotationSpeed;

    renderer.render(scene, camera);
};




// WASD controls
const keys = { w: false, a: false, s: false, d: false };

document.addEventListener('keydown', (event) => {
    if (event.key === ' ') {
        rotating = !rotating;
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

animate();

