class VolumeShader extends Shader {
    constructor(volumeTexture, stepSize, size, densityThreshold, clipPlane) {
        super("volume_vert", "volume_frag");

        this.material.uniforms = {
            volumeTexture: { value: volumeTexture },
            stepSize: { value: stepSize },
            size: { value: size },
            densityThreshold: { value: densityThreshold },
            colorDefinitionsDensity: { value: Array(10).fill(-1.0) },
            colorDefinitionsColor: { value: Array(10).fill(new THREE.Vector4()) },
            offColor: { value: new THREE.Vector3(0.7, 0.7, 0.7) },

            clipPlane: { value: clipPlane },
        };
    }
}