class VolumeShader extends Shader {
    constructor(volumeTexture, color, stepSize, maxSteps, opacityThreshold) {
        super("volume_vert", "volume_frag");

        this.setUniform("volumeTexture", volumeTexture, "t3");
        this.setUniform("color", new THREE.Vector3(...color), "v3v");
        this.setUniform("stepSize", stepSize, "f");
        this.setUniform("maxSteps", maxSteps, "f");
        this.setUniform("opacityThreshold", opacityThreshold, "f");
        this.setUniform("size", new THREE.Vector3(
            volumeTexture.width,
            volumeTexture.height,
            volumeTexture.depth
        ), "v3v");
    }
}