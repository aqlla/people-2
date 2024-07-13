import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';

// Initialize the Three.js Scene
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.enabled = true; // Enable shadow map
renderer.shadowMap.type = THREE.PCFSoftShadowMap; // Softer shadows
document.body.appendChild(renderer.domElement);

// Basic Lighting
const ambientLight = new THREE.AmbientLight(0x404040); // Soft white light
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 10, 7.5);
directionalLight.castShadow = true; // Enable shadows for the directional light
directionalLight.shadow.mapSize.width = 2048; // Shadow quality
directionalLight.shadow.mapSize.height = 2048; // Shadow quality
directionalLight.shadow.camera.near = 0.5;
directionalLight.shadow.camera.far = 50;
directionalLight.shadow.camera.left = -10;
directionalLight.shadow.camera.right = 10;
directionalLight.shadow.camera.top = 10;
directionalLight.shadow.camera.bottom = -10;
scene.add(directionalLight);

// Adding a plane to receive shadows
const planeGeometry = new THREE.PlaneGeometry(200, 200);
const planeMaterial = new THREE.MeshStandardMaterial({ color: 0x888888 });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = -Math.PI / 2;
plane.position.y = -1;
plane.receiveShadow = true; // Plane receives shadows
scene.add(plane);

// Simple Cube for Testing
const cubeGeometry = new THREE.BoxGeometry();
const cubeMaterial = new THREE.MeshStandardMaterial({ color: 0x0077ff });
const cube = new THREE.Mesh(cubeGeometry, cubeMaterial);
cube.castShadow = true; // Cube casts shadow
cube.receiveShadow = true; // Cube receives shadow
scene.add(cube);

// Set camera position
camera.position.set(0, 5, 10);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true; // Enable damping for smoother controls
controls.dampingFactor = 0.25;
controls.screenSpacePanning = false;
controls.maxPolarAngle = Math.PI / 2;

// Handle window resize
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Render the Scene
const animate = () => {
    requestAnimationFrame(animate);
    controls.update();
    cube.rotation.y += 0.01; // Rotate the cube for better visibility
    renderer.render(scene, camera);
};
animate();