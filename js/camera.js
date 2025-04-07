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
 * Camera that orbits around a centered object. Only uses mouse input!
 *
 * @author Manuela Waldner
 */

class OrbitCamera {
    constructor(camera, targetPos, radius, domElement){
        this.camera = camera;
        this.targetPos = targetPos;
        this.camera.lookAt(this.targetPos);
        this.radius = radius;
        this.minRadius = radius / 2;
        this.maxRadius = radius * 2;
        this.phi = 0;
        this.theta = 0;

        this.pointerPos = new THREE.Vector2(0, 0);
        this.drag = false;
        this.autoRotate= false;

        this.domElement = domElement;
        this.domElement.addEventListener('pointerdown', event => this.#onMouseDown(event), false);
        this.domElement.addEventListener('pointerup', event => this.#onMouseUp(event), false);
        this.domElement.addEventListener('pointermove', event => this.#onMouseMove(event), false);
        this.domElement.addEventListener('wheel', event => this.#onMouseWheel(event), false);
        // catch mouse-up outside the browser window
        window.addEventListener('pointerup', event => this.#onMouseUp(event));

        this.camera.up.set(0, 0, -1);
        this.#updateCamera(0, 0, 0);
    }

    update(){
        if(this.autoRotate){
            this.#updateCamera(0.5, 0, 0);
        }
    }

    #updateCamera(dx, dy, dz){
        this.phi += dx / 100.0;
        this.theta += dy / 100.0;
        this.radius += dz / 10.0;

        const clamp = (num, min, max) => Math.min(Math.max(num, min), max);
        this.theta = clamp(this.theta, -Math.PI / 2.0, Math.PI / 2.0);
        this.radius = clamp(this.radius, this.minRadius, this.maxRadius);

        this.camera.position.x = -this.radius * Math.cos(this.theta)* Math.sin(this.phi);
        this.camera.position.y = -this.radius * Math.cos(this.theta) * Math.cos(this.phi);
        this.camera.position.z = this.radius * Math.sin(this.theta);

        this.camera.lookAt(this.targetPos);

        requestAnimationFrame(paint);
    }

    #onMouseDown(event){
        event.preventDefault(); // no scrolling!
        let that = this;

        switch(event.button){
            // left mouse button only
            case 0:
                that.drag = true;
                that.pointerPos.x = event.clientX;
                that.pointerPos.y = event.clientY;
                break;
        }
    }

    #onMouseUp(event){
        switch(event.button){
            case 0:
                this.drag = false;
                break;
        }
    }

    #onMouseMove(event){
        let that = this;
        if(this.drag){
            let newPointerPos = new THREE.Vector2(event.clientX, event.clientY);
            let pointerDiff = new THREE.Vector2().subVectors(that.pointerPos, newPointerPos);
            that.pointerPos = newPointerPos;
            that.#updateCamera(pointerDiff.x, pointerDiff.y, 0);
        }

    }

    #onMouseWheel(event){
        event.preventDefault();
        this.#updateCamera(0, 0, -event.wheelDelta);
    }
}