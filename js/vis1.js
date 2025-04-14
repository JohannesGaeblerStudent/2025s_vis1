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
let volumeContext = null;

//UI Elements
var invertColor = false;
var color = [1.0, 1.0, 1.0];

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

/**
 * Construct the THREE.js scene and update histogram when a new volume is loaded.
 */
async function resetVis(){
    // Create new scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);

    // Create volume and context
    createVolumeTexture();
    volumeShader = new VolumeShader(
        volumeTexture,
        1,
        volume.width,
        volume.height,
        volume.depth
    );
    await volumeShader.load();
    volumeContext = new VolumeContext(volumeTexture, volume, volumeShader);

    // ====================================
    // TODO: Remove this once the UI works:
    volumeContext.setDensityThreshold(0.4, 0.8);
    for (let i = 0; i <= 10; i++) {
        const step = i / 10;
        volumeContext.setColorStep(i, step, new THREE.Color(step, 1.0 - step, 1.0 - step));
    }
    volumeContext.setOffColor(new THREE.Color(0.1, 0.1, 0.1))
    // ====================================

    const geometry = new THREE.BoxGeometry(volume.width,volume.height,volume.depth);
    const mesh = new THREE.Mesh(geometry);
    mesh.position.set(0, 0,0);
    mesh.material = volumeContext.material;
    scene.add(mesh);

    // =================================================
    // TODO: Make wireframe toggle-able in UI or remove?
    const wireframe = new THREE.LineSegments(
        new THREE.EdgesGeometry(new THREE.BoxGeometry(volume.width, volume.height, volume.depth)),
        new THREE.LineBasicMaterial({ color: new THREE.Color(0.4, 0.4, 0.4) })
    );
    scene.add(wireframe);
    // =================================================

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
