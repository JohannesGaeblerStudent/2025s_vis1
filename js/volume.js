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
 * Volume class handling simple volume.dat files. Loads the volumes as float arrays.
 *
 * @author Manuela Waldner
 * @author Diana Schalko
 */
class Volume {
    constructor(uint16Array) {
        this.width = uint16Array[0];
        this.height = uint16Array[1];
        this.depth = uint16Array[2];
        this.slice = this.width * this.height;
        this.size = this.slice * this.depth;
        this.max = Math.max(this.width, this.height, this.depth);
        this.scale = new THREE.Vector3(this.width, this.height, this.depth);

        let floatArray = [];
        uint16Array.slice(3).forEach(function(voxel){
            floatArray.push(voxel / 4095.0);
        });
        this.voxels = Float32Array.from(floatArray);

        console.log(this.voxels.length + " voxels loaded - ["
            + this.width + ", " + this.height + ", " + this.depth + "], max: " + this.max);
    }
}