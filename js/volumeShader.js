class VolumeShader extends Shader {
    constructor(volumeTexture, stepSize, width, height, depth) {
        super("volume_vert", "volume_frag");

        this.material.uniforms = {
            volumeTexture: { value: volumeTexture },
            stepSize: { value: stepSize },
            size: { value: new THREE.Vector3(width, height, depth) },
            densityThreshold: { value: new THREE.Vector2(0.0, 1.0) },
            colorDefinitionsDensity: { value: Array(10).fill(-1.0) },
            colorDefinitionsColor: { value: Array(10).fill(new THREE.Vector4()) },
            offColor: { value: new THREE.Vector3(0.7, 0.7, 0.7) }
        };
    }
}