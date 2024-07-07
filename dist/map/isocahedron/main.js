import { THREE } from 'three';
// import * as THREE from "../node_modules/three/build/three.module.js"
import { Grid } from './worldgen2';
// import { FontLoader } from 'three/addons/loaders/FontLoader.js';
// import { TextGeometry } from 'addons/geometries/TextGeometry.js';
const width = window.innerWidth;
const height = window.innerHeight - 10;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(width, height);
const cameraDistance = 65;
const camera = new THREE.PerspectiveCamera(cameraDistance, width / height, 1, 200);
camera.position.z = -cameraDistance;
const scene = new THREE.Scene();
scene.fog = new THREE.Fog(0x000000, cameraDistance * .4, cameraDistance * 1.2);
const img = document.getElementById("projection");
const projectionCanvas = document.createElement('canvas');
const projectionContext = projectionCanvas.getContext('2d');
projectionCanvas.width = img.width;
projectionCanvas.height = img.height;
projectionContext.drawImage(img, 0, 0, img.width, img.height);
let pixelData;
let maxLat = -100;
let maxLon = 0;
let minLat = 0;
let minLon = 0;
const isLand = (lat, lon) => {
    const x = img.width * (lon + 180) / 360;
    const y = img.height * (lat + 90) / 180;
    if (!pixelData) {
        pixelData = projectionContext.getImageData(0, 0, img.width, img.height);
    }
    return pixelData.data[(y * pixelData.width + x) * 4] === 0;
};
const meshMaterials = [
    new THREE.MeshBasicMaterial({ color: 0x7cfc00, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x397d02, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x77ee00, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x61b329, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x83f52c, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x83f52c, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x4cbb17, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x00ee00, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x00aa11, transparent: true }),
];
const oceanMaterial = [
    new THREE.MeshBasicMaterial({ color: 0x0f2342, transparent: true }),
    new THREE.MeshBasicMaterial({ color: 0x0f1e38, transparent: true })
];
let introTick = 0;
let currentTiles;
let seenTiles = {};
// const seenTiles = {};
const createScene = function (radius, divisions, tileSize) {
    introTick = -1;
    while (scene.children.length > 0) {
        scene.remove(scene.children[0]);
    }
    let material;
    const geohex = new Grid(radius, divisions, tileSize);
    for (let i = 0; i < geohex.tiles.length; i++) {
        const t = geohex.tiles[i];
        const latLon = t.getCoords(geohex.radius);
        const geometry = new THREE.Geometry();
        for (let j = 0; j < t.bounds.length; j++) {
            const bp = t.bounds[j];
            geometry.vertices.push(new THREE.Vector3(bp.x, bp.y, bp.z));
        }
        geometry.faces.push(new THREE.Face3(0, 1, 2));
        geometry.faces.push(new THREE.Face3(0, 2, 3));
        geometry.faces.push(new THREE.Face3(0, 3, 4));
        if (geometry.vertices.length > 5) {
            geometry.faces.push(new THREE.Face3(0, 4, 5));
        }
        if (isLand(latLon.lat, latLon.lon)) {
            material = meshMaterials[Math.floor(Math.random() * meshMaterials.length)];
        }
        else {
            material = oceanMaterial[Math.floor(Math.random() * oceanMaterial.length)];
        }
        material.opacity = 0.3;
        const mesh = new THREE.Mesh(geometry, material.clone());
        scene.add(mesh);
        geohex.tiles[i].mesh = mesh;
    }
    currentTiles = geohex.tiles.slice().splice(0, 12);
    currentTiles.forEach(function (item) {
        seenTiles[item.id] = 1;
        item.mesh.material.opacity = 1;
    });
    window['geohex'] = geohex;
    introTick = 0;
};
createScene(30, 25, .95);
const startTime = Date.now();
let lastTime = Date.now();
let cameraAngle = -Math.PI / 1.5;
const tick = function () {
    const dt = Date.now() - lastTime;
    const rotateCameraBy = (2 * Math.PI) / (200000 / dt);
    cameraAngle += rotateCameraBy;
    lastTime = Date.now();
    camera.position.x = cameraDistance * Math.cos(cameraAngle);
    camera.position.y = Math.sin(cameraAngle) * 10;
    camera.position.z = cameraDistance * Math.sin(cameraAngle);
    camera.lookAt(scene.position);
    renderer.render(scene, camera);
    const nextTiles = [];
    currentTiles.forEach(function (item) {
        item.neighbors.forEach(n => {
            if (!seenTiles[n.id]) {
                n.mesh.material.opacity = 1;
                nextTiles.push(n);
                seenTiles[n.id] = 1;
            }
        });
    });
    currentTiles = nextTiles;
    requestAnimationFrame(tick);
};
function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
function clamp(val, min, max) {
    return Math.min(Math.max(min, val), max);
}
const $id = (id) => document.getElementById(id);
const $input = (id) => $id(id);
const generate = () => {
    const radius = $input('radius').value;
    const nDivision = $input('subdivisions').value;
    const tileSize = $input('tileSize')?.value;
    createScene(clamp(radius, .1, 10000), clamp(nDivision, 1, 100), clamp(tileSize, .0001, 1));
};
document.getElementById('generate')?.addEventListener('click', generate);
window.addEventListener('resize', onWindowResize, false);
document.getElementById("container").append(renderer.domElement);
requestAnimationFrame(tick);
window['scene'] = scene;
window['createScene'] = createScene;
