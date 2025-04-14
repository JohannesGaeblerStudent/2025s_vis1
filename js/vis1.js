/**
 * Vis 1 Task 1 Framework
 * Copyright (C) TU Wien
 *   Institute of Visual Computing and Human-Centered Technology
 *   Research Unit of Computer Graphics
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are not permitted.
 *
 * Main script for Vis1 exercise. Loads the volume, initializes the scene, and contains the paint function.
 *
 * @author Manuela Waldner
 * @author Laura Luidolt
 * @author Diana Schalko
 */
let renderer, camera, scene, orbitCamera;
let canvasWidth, canvasHeight = 0;
let container = null;
let volume = null;
let fileInput = null;

let volumeTexture = null;
let volumeShader = null;

/**
 * Load all data and initialize UI here.
 */
function init() {
    // volume viewer
    container = document.getElementById("viewContainer");
    canvasWidth = window.innerWidth * 0.7;
    canvasHeight = window.innerHeight * 0.7;

    // WebGL renderer
    renderer = new THREE.WebGLRenderer();
    renderer.setSize( canvasWidth, canvasHeight );
    container.appendChild( renderer.domElement );

    // read and parse volume file
    fileInput = document.getElementById("upload");
    fileInput.addEventListener('change', readFile);


}

/**
 * Handles the file reader. No need to change anything here.
 */
function readFile(){
    let reader = new FileReader();
    reader.onloadend = function () {
        console.log("data loaded: ");

        let data = new Uint16Array(reader.result);
        volume = new Volume(data);

        resetVis();
    };
    reader.readAsArrayBuffer(fileInput.files[0]);
}

/**
 * Creates a 3D texture based on the volume data loaded.
 */
function createVolumeTexture() {
    volumeTexture = new THREE.Data3DTexture(
        volume.voxels,
        volume.width,
        volume.height,
        volume.depth
    );

    volumeTexture.format = THREE.RedFormat;
    volumeTexture.type = THREE.FloatType;
    volumeTexture.minFilter = THREE.LinearFilter;
    volumeTexture.magFilter = THREE.LinearFilter;

    // Repeat edge values when sampling outside of texture boundaries.
    volumeTexture.wrapS = THREE.ClampToEdgeWrapping;
    volumeTexture.wrapT = THREE.ClampToEdgeWrapping;
    volumeTexture.wrapR = THREE.ClampToEdgeWrapping;

    volumeTexture.needsUpdate = true;
}

function createPointCloudFromVolume(volume) {
    const positions = [];
    for (let z = 0; z < volume.depth; z++) {
        for (let y = 0; y < volume.height; y++) {
            for (let x = 0; x < volume.width; x++) {
                const i = x + y * volume.width + z * volume.width * volume.height;
                const value = volume.voxels[i];
                if (value > 0) { // or any threshold
                    positions.push(x, y, z);
                }
            }
        }
    }

    const geometry = new THREE.BufferGeometry();
    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({ size: 0.5, color: 0xffffff });
    const points = new THREE.Points(geometry, material);
    scene.add(points);
}

/**
 * Construct the THREE.js scene and update histogram when a new volume is loaded.
 */
async function resetVis(){
    // Create new scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);

    createVolumeTexture();
    volumeShader = new VolumeShader(
        volumeTexture,
        [1.0, 1.0, 1.0], // Color
        1,
        1,
        false,
        volume.width,
        volume.height,
        volume.depth
    );

    // createPointCloudFromVolume(volume);
    const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(volume.width, volume.height, volume.depth)),
        new THREE.LineBasicMaterial({ color: 0x00ff00 })
    );
    scene.add(wireframe);

    const geometry = new THREE.BoxGeometry(volume.width,volume.height,volume.depth);
    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(0, 0,0);

    const material = volumeShader.material;
    await volumeShader.load();
    mesh.material = material;
    scene.add(mesh);

    // Orbit camera around center of the volume
    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0, 0, 0), 2 * volume.max, renderer.domElement);

    // Start rendering loop
    requestAnimationFrame(paint);
}

/**
 * Render the scene and update all necessary shader information.
 */
function paint(){
    if (volume) {
        renderer.render(scene, camera);
    }
}
