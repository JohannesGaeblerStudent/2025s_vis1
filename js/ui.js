document.addEventListener("DOMContentLoaded", () => {

    //Toggles (ie. Wireframe)
    document.getElementById("wireframeToggle").addEventListener("change", async function () {
        addWireframe = this.checked;
        await createVolumeShader();
    })


    //Density set minimum and maximum
    document.getElementById("densityMin").addEventListener("change", async function () {
        densityMin = this.value;
        await createVolumeShader();
    })

    document.getElementById("densityMax").addEventListener("change", async function () {
        densityMax = this.value;
        await createVolumeShader();
    })

    //Color set RGB values
    document.getElementById("redChannel").addEventListener("change", async function () {
        color[0] = this.value;
        await createVolumeShader();
    })

    document.getElementById("greenChannel").addEventListener("change", async function () {
        color[1] = this.value;
        await createVolumeShader();
    })

    document.getElementById("blueChannel").addEventListener("change", async function () {
        color[2] = this.value;
        await createVolumeShader();
    })

})