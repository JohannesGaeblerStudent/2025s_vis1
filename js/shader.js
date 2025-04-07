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
 * Shader parent class. Loads .essl files from the folder shaders. Provides methods to set uniforms.
 * The function load() has to be explicitly called from an async function!
 *
 * @author Manuela Waldner
 */
class Shader {
    constructor(vertexProgram, fragmentProgram) {
        this.vertexProgram = vertexProgram;
        this.fragmentProgram = fragmentProgram;
        this.material = new THREE.ShaderMaterial
        ({
            glslVersion: THREE.GLSL3,
            uniforms: {},
            transparent: true
        });
    }

    async #loadShader(shader, name){
        const program = await d3.text("shaders/"+name+".essl");
        this.material[shader] = program;
    }

    // this function has to be explicitly called after the constructor from another async function like that:
    // await yourShader.load();
    async load(){
        await this.#loadShader("vertexShader", this.vertexProgram);
        await this.#loadShader("fragmentShader", this.fragmentProgram);
    }

    // use the type parameter for array variants that are not supported by THREE.Uniform yet:
    // e.g., v2v (array of THREE.Vector2), v3v (array of THREE.Vector3) etc.
    // otherwise only set key and value
    setUniform(key, value, type){
        if(typeof type !== 'undefined'){
            this.material.uniforms[key] = {
                'type': type,
                'value': value
            };
        }
        else{
            this.material.uniforms[key] = new THREE.Uniform(value);
        }
    }
}