/**
 * Volume context which supports setting visualization parameters at runtime.
 */
class VolumeContext {
    constructor(texture, volume, shader) {
        this.texture = texture;
        this.volume = volume;
        this.material = shader.material;
    }

    setDensityThreshold(min, max) {
        this.material.uniforms.densityThreshold.value = new THREE.Vector2(min, max);
        this.material.needsUpdate = true;
    }

    setColorStep(index, position, color) {
        // TODO: Handle alpha for color properly
        const rgba = new THREE.Vector4(color.r, color.g, color.b, 1.0);
        this.material.uniforms.colorDefinitionsColor.value[index] = rgba;
        this.material.uniforms.colorDefinitionsDensity.value[index] = position;
        this.material.needsUpdate = true;
    }

    setOffColor(color) {
        const rgba = new THREE.Vector4(color.r, color.g, color.b, 1.0);
        this.material.uniforms.offColor.value = rgba;
        this.material.needsUpdate = true;
    }
}