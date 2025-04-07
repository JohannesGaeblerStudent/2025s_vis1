class VolumeShader extends Shader {
    constructor(volumeTexture, color, stepSize, maxSteps, opacityThreshold) {
        super("volume_vert", "volume_frag");

        // TODO: These parameters might not be complete, I just added what I could think of

        this.setUniform("volumeTexture", volumeTexture.image, "t3"); // TODO: is volumeTexture.image correct here?
        this.setUniform("color", new THREE.Vector3(color[0], color[1], color[2]), "v3v");
        this.setUniform("stepSize", stepSize);
        this.setUniform("maxSteps", maxSteps);
        this.setUniform("opacityThreshold", opacityThreshold);
    }
}