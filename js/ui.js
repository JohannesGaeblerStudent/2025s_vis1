document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("invertToggle").addEventListener("change", function () {
        invertColor = this.checked;
    })

    document.getElementById("colorPicker").addEventListener("change", function () {
        color = this.value;
    })

})