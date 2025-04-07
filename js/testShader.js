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
 * Useless toy shader that just sets a uniform color for the scene. Sends the given color as RGB and BGR.
 * Illustrates how to initialize new shaders and how to set uniforms.
 *
 * @author Manuela Waldner
 */
class TestShader extends Shader{
    constructor(color){
        super("color_vert", "color_frag");
        // sends color as RGB or BGR in a Vector3 array
        this.setUniform("color",
            [
                new  THREE.Vector3(color[0], color[1], color[2]),
                new THREE.Vector3(color[2], color[1], color[0])
            ],
            "v3v");
        // sends whether to use RGB or BGR as index (0: RGB, 1: BGR)
        this.setUniform("colorIdx", 0);
    }
}