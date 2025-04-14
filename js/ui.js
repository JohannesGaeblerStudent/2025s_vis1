document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("invertToggle").addEventListener("change", async function () {
        addWireframe = this.checked;
        await createVolumeShader();
    })

    document.getElementById("colorPicker").addEventListener("change", async function () {
        color = hexToRgbArray(this.value);
        await createVolumeShader();
    })

    function hexToRgbArray(hex) {
        const r = parseInt(hex.slice(1, 3), 16);
        const g = parseInt(hex.slice(3, 5), 16);
        const b = parseInt(hex.slice(5, 7), 16);
        return [r, g, b];
    }

})