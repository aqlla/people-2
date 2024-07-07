import * as THREE from 'three'


const onload = three => {
    const fov = 25;
    const radius = 10
    const subs = 20
    const hexSize = .92
    const speed = 2
    const width = window.innerWidth;
    const height = window.innerHeight;

    let enableRotation = true
    let cameraAngle = [0, 0];
    let lastTime = Date.now();

    const renderer = new three.WebGLRenderer({ antialias: true });
    const camera = new three.PerspectiveCamera(fov, width / height, 1, 100);
    const scene = new three.Scene();
    const materialSelector = imageMaterialSelector('projection');

    const tick = () => {
        // if (enableRotation) {
            const dir = getDirection()
            const now = Date.now();
            const dist = (speed / 100) * (now - lastTime)
            cameraAngle[0] += dir[0] * dist;
            cameraAngle[1] += dir[1] * dist;
            lastTime = now;

            // const forward = new three.Vector3();
            // camera.getWorldDirection(forward);

            // // Calculate right vector
            // const right = new three.Vector3();
            // right.crossVectors(camera.up, forward).normalize();

            // // Calculate movement
            // const movement = new three.Vector3();

            // if (pressed.w) movement.add(forward.clone().multiplyScalar(speed));
            // if (pressed.s) movement.add(forward.clone().multiplyScalar(-speed));
            // if (pressed.a) movement.add(right.clone().multiplyScalar(-speed));
            // if (pressed.d) movement.add(right.clone().multiplyScalar(speed));

            // camera.position.add(movement);

            camera.position.x = fov * Math.cos(cameraAngle);
            camera.position.y = 20;
            camera.position.z = fov * Math.sin(cameraAngle);
            // camera.position.x += movement.x;
            // camera.position.y += movement.y;
            // camera.position.z = 5
            // // Rotate the scene
            // scene.rotation.x += 0.001;
            // scene.rotation.y += 0.001;
            // camera.position.x = cameraAngle[0]//fov * Math.cos(cameraAngle[0]);
            // camera.position.y = 10;
            // camera.position.z = cameraAngle[1] //* Math.sin(cameraAngle[1]);

            camera.lookAt(scene.position);
            renderer.render(scene, camera);
        // }
        requestAnimationFrame(tick);
    }

    const onWindowResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight;
        camera.updateProjectionMatrix();
        renderer.setSize(window.innerWidth, window.innerHeight);
    }

    onWindowResize()
    window.addEventListener( 'resize', onWindowResize, false );
    document.getElementById('container').append(renderer.domElement);

    const pressed = {
        w: false, a: false, s: false, d: false
    }

    const getDirection = () => {
        const dir = [0, 0]
        if (pressed.a) {
            dir[0] = -1;
        } else if (pressed.d) {
            dir[0] = 1;
        }

        if (pressed.w) {
            dir[1] = -1;
        } else if (pressed.s) {
            dir[1] = 1;
        }

        return dir
    }

    document.onkeydown = e => {
        switch (e.key) {
            case " ":
                // lastTime = Date.now();
                enableRotation = !enableRotation
                break;

            case 'w':
            case 'a':
            case 's':
            case 'd':
                pressed[e.key] = true;
                break;
        }
    }

    document.onkeyup = e => {
        switch (e.key) {
            case 'w':
            case 'a':
            case 's':
            case 'd':                
                pressed[e.key] = false;
                break;
        }
    }

    // Init
    const index = [[0, 1, 2], [0, 3, 4], [0, 2, 3], [0, 4, 5]].flat()
    // const getMaterial = coords => materialSelector(coords) ?
    //     meshes(three)['land'][0] : meshes(three)['ocean'][0]

    // const getTileGeometry = tile => {
    //     // const positions = tile.faces.flatMap(i => allVertices[i]);
    //     const geometry = new three.BufferGeometry().setFromPoints(tile)
    //     // geometry.setPositions(tile.coords)
    //     // geometry.setIndex(index.slice(0, (tile.bounds.length - 2) * 3));
    //     geometry.setAttribute('position', new three.Float32BufferAttribute(tile.bounds, 3));
    //     geometry.computeVertexNormals();
    //     return geometry;
    // }

    // const getTileMesh = tile =>
    //     new three.Mesh(getTileGeometry(tile), getMaterial(tile.coords));

    // const geo = new Hexasphere(radius, subs, hexSize)
    // console.log(geo)
    // geo.tiles.map(getTileMesh)
    //     .forEach(m => scene.add(m))

    

    // Function to create a BufferGeometry from tile vertices
    const createTileGeometry = (vertices, allVertices) => {
        const positions = vertices.flatMap(i => allVertices[i]);
        
        const geometry = new three.BufferGeometry().setFromPoints(vertices);
        

        // geometry.setIndex(index.slice(0, vertices.length).flat());
        // geometry.setIndex(index.slice(0, (vertices.length - 2) * 3).flat());
        geometry.setAttribute('position', new three.Float32BufferAttribute(positions, 3));
        // geometry.computeVertexNormals();
        return geometry;
    };

    // const polyhedron = initializeIcosahedron();
    const polyhedron = createGoldbergPolyhedron(2);
    console.log(polyhedron)
    // Add each tile to the scene
    polyhedron.tiles.vertices.forEach((v, i) => {
        const geometry = createTileGeometry(v, polyhedron.vertices);
        // const coords = calculateTileCenter(tile.vertices, polyhedron.vertices)
        const material = new three.MeshBasicMaterial({ color: 0x00ff00, wireframe: true });
        const mesh = new three.Mesh(geometry, material);
        scene.add(mesh);
    });


    requestAnimationFrame(tick);
};

window.onload = _ => onload(THREE)