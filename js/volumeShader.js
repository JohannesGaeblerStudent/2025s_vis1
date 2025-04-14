class VolumeShader extends Shader {
    constructor(volumeTexture, color, stepSize, alphaScale, invertColor, width, height, depth) {
        super("volume_vert", "volume_frag");

        this.setUniform("volumeTexture", volumeTexture);
        this.setUniform("vColor", new THREE.Vector3(...color), "v3v");
        this.setUniform("stepSize", stepSize, "f");
        this.setUniform("alphaScale", alphaScale, "f");
        this.setUniform("invertColor", invertColor, "b");
        this.setUniform("size", new THREE.Vector3(
            width,
            height,
            depth
        ));
    }
}