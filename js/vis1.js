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
window.volumeContext = null;

let geometry = null;
let mesh = null;
let voxels = null;

let histogram = null;

var color = [1.0, 1.0, 1.0];
var densityMin = 0.0;
var densityMax = 1.0;

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
    renderer.setSize(canvasWidth, canvasHeight);
    container.appendChild(renderer.domElement);

    // read and parse volume file
    fileInput = document.getElementById("upload");
    fileInput.addEventListener('change', readFile);
}

/**
 * Handles the file reader. No need to change anything here.
 */
function readFile() {
    let reader = new FileReader();
    reader.onloadend = function () {
        console.log("data loaded: ");

        let data = new Uint16Array(reader.result);
        volume = new Volume(data);

        let size = new THREE.Vector3(volume.width, volume.height, volume.depth).normalize();
        geometry = new THREE.BoxGeometry(size.x, size.y, size.z);
        mesh = new THREE.Mesh(geometry);

        window.resetVis();
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

    window.createEditorUI();
}

window.createVolumeShader = async function() {
    // Create volume and context
    volumeShader = new VolumeShader(
        volumeTexture,
        0.001,
        new THREE.Vector3(volume.width, volume.height, volume.depth),
        new THREE.Vector3(densityMin, densityMax),

        //Cutting Plane
        new THREE.Vector4(window.angleX, window.angleY, window.clipSide, window.clipOffset),
    );

    await volumeShader.load();

    window.volumeContext = new VolumeContext(volumeTexture, volume, volumeShader);
    let i = 0;
    for (let selector of window.selectors.sort((a, b) => b.index - a.index)) {
        window.volumeContext.setColorStep(i, selector.index / 100, hexToRgb(selector.color), selector.opacity);
        i++;
    }
    window.volumeContext.setOffColor(new THREE.Color(0.1, 0.1, 0.1))

    mesh.material = window.volumeContext.material;
    paint();
}

window.buildFilteredPoints = async function() {
    if(!histogram) {return;}
    if(window.clipSide === 2){
        histogram.updateData(volume.voxels);
        return;
    }
    const angX = window.angleX;
    const angY = window.angleY;
    const side = window.clipSide;
    const w = window.clipOffset;

    const nx = volume.width;
    const ny = volume.height;
    const nz = volume.depth;

    const flip = side < 0 ? -1 : 1;

    // Compute plane‐normal n = Ry(angY)·Rx(angX)·[0,0,1]
    const cosX = Math.cos(angX), sinX = Math.sin(angX);
    const cosY = Math.cos(angY), sinY = Math.sin(angY);
    // After Rx: v1 = [0, −sinX, cosX]
    // After Ry(v1): n = [ sinY·cosX, −sinX, cosY·cosX ]
    const nx_ =  sinY * cosX;
    const ny_ = -sinX;
    const nz_ =  cosY * cosX;
    const d   = -w;  // plane: n·p + d = 0

    const out = [];
    let idx = 0;

    // Loop over every voxel index (i,j,k)
    for (let k = 0; k < nz; k++) {
        // If your volume is centered in [−1,+1], convert k → zk accordingly:
        const zk = (k / (nz - 1)) * 2 - 1;
        for (let j = 0; j < ny; j++) {
            const yj = (j / (ny - 1)) * 2 - 1;
            for (let i = 0; i < nx; i++) {
                const xi = (i / (nx - 1)) * 2 - 1;
                const intensity = volume.voxels[idx++];  // the Float32 value in [0,1]

                // Compute side = n·p + d
                const side = nx_ * xi + ny_ * yj + nz_ * zk + d;

                // If flip < 0, keep points with side ≥ 0; else keep side ≤ 0
                if ((flip < 0 && side >= 0) || (flip > 0 && side <= 0)) {
                    // Only push the point if it survives the plane test
                    out.push(intensity);
                }
            }
        }
    }
    histogram.updateData(out);
}

/**
 * Construct the THREE.js scene and update histogram when a new volume is loaded.
 */
async function resetVis() {
    // Create new scene and camera
    scene = new THREE.Scene();
    camera = new THREE.PerspectiveCamera(75, canvasWidth / canvasHeight, 0.1, 1000);

    createVolumeTexture();
    await createVolumeShader();

    scene.add(mesh);

    // Orbit camera around center of the volume
    orbitCamera = new OrbitCamera(camera, new THREE.Vector3(0, 0, 0), 2, renderer.domElement);

    // Start rendering loop
    requestAnimationFrame(paint);

    // Update histogram when new volume is loaded
    if (volume && volume.voxels) {
        if (!histogram) {
            histogram = new Histogram('#histogramContainer', volume.voxels);
        } else {
            histogram.updateData(voxels);
        }

        histogram.render();
    }
}

/**
 * Render the scene and update all necessary shader information.
 */
function paint() {
    if (volume) {
        renderer.render(scene, camera);
    }
}
