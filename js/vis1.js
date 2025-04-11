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

    // TODO: No idea if the texture created here is actually correct, I just put this in quickly

    volumeTexture = new THREE.Data3DTexture(
        volume.voxels,
        volume.width,
        volume.height,
        volume.depth
    );
    volumeTexture.needsUpdate = true;
}

/**
 * Creates a new volume shader based on the volume texture.
 */
async function createVolumeShader() {

    // TODO: Do we need to make those parameters dynamically changeable in the UI?
    // Create wireframe box to visualize volume bounds
    const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(volume.width, volume.height, volume.depth)),
        new THREE.LineBasicMaterial({ color: 0x00ff00 })
    );
    scene.add(wireframe);

    volumeShader = new VolumeShader(
        volumeTexture,
        [1.0, 1.0, 1.0], // Color
        1,             // Smaller step size for better quality
        200,             // Max steps
        0.1              // Lower threshold to see more data
    );
    await volumeShader.load();
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

    createPointCloudFromVolume(volume);

    createVolumeTexture();
    await createVolumeShader();

    const cube = new THREE.BoxGeometry(volume.width, volume.height, volume.depth);
    const mesh = new THREE.Mesh(cube, volumeShader.material);
    mesh.material.side = THREE.BackSide;
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
