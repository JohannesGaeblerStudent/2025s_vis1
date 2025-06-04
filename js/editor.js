// editor.js

// 1) Define the globals (if they don't already exist)
window.angleX = 0;
window.angleY = 0;
window.clipSide = 2;
window.clipOffset = 0;

let buildHistTimeout = null;

// 2) Expose a function that, when called, injects the entire panel into #editor-container
window.createEditorUI = function () {
    const container = document.getElementById("editorContainer");
    if (!container) return;
    if (container.dataset.injected) return;
    container.dataset.injected = "true";

    // --- A) Create a wrapper DIV for styling
    const panel = document.createElement("div");
    panel.style.backgroundColor = "#333";
    panel.style.color = "#fff";
    panel.style.padding = "12px";
    panel.style.borderRadius = "6px";
    panel.style.fontFamily = "Arial, sans-serif";
    panel.style.width = "260px";

    // --- B) "Render Side:" label + <select>
    const rsLabel = document.createElement("label");
    rsLabel.textContent = "Render Side: ";
    rsLabel.style.display = "inline-block";
    rsLabel.style.marginBottom = "8px";
    rsLabel.style.fontSize = "14px";

    const select = document.createElement("select");
    select.style.fontSize = "14px";
    select.style.padding = "2px 4px";
    select.style.borderRadius = "4px";
    select.style.border = "1px solid #555";
    select.style.backgroundColor = "#444";
    select.style.color = "#fff";
    select.innerHTML = `
    <option value="2">None</option>
    <option value="-1.0">Above Plane</option>
    <option value="1.0">Below Plane</option>
  `;

    // When the user picks a different option, store it as a number:
    select.addEventListener("change", () => {
        window.clipSide = Number(select.value);
        // If you want to re-render immediately:
        window.buildFilteredPoints();
        window.createVolumeShader();
    });

    // Put them on the same line
    const rsContainer = document.createElement("div");
    rsContainer.appendChild(rsLabel);
    rsContainer.appendChild(select);
    panel.appendChild(rsContainer);

    // --- C) Section heading: "Cutting Plane Controls"
    const heading = document.createElement("div");
    heading.textContent = "Cutting Plane Controls";
    heading.style.marginTop = "12px";
    heading.style.marginBottom = "8px";
    heading.style.fontWeight = "bold";
    heading.style.fontSize = "15px";
    panel.appendChild(heading);

    // --- D) Helper to create “Rotation X” or “Rotation Y” row
    function makeSliderRow(axis) {
        // axis: "X" or "Y"
        const row = document.createElement("div");
        row.style.display = "flex";
        row.style.alignItems = "center";
        row.style.marginBottom = "8px";

        // 1) Label
        const label = document.createElement("label");
        label.textContent = `Rotation ${axis}: `;
        label.style.fontSize = "13px";
        label.style.width = "72px"; // fixed width so sliders align
        row.appendChild(label);

        // 2) <input type="range">
        const slider = document.createElement("input");
        slider.type = "range";

        if (axis === "X" || axis === "Y") {
            // Full circle in radians:
            slider.min  = (-Math.PI * 2).toFixed(4);   // “−3.1416”
            slider.max  = ( Math.PI * 2).toFixed(4);   // “+3.1416”
            slider.step = "0.01";
            slider.value = "0";
        } else if (axis === "W") {
            slider.min  = "0";
            slider.max  = "0.25";
            slider.step = "0.01";
            slider.value = "0";
        }

        slider.style.flex = "1";
        slider.id = `slider-rot-${axis.toLowerCase()}`;

        // 3) Listen for changes and call resetVis()
        slider.addEventListener("input", () => {
            const v = Number(slider.value);
            if (axis === "X") {
                window.angleX = v;
            }else if (axis === "Y"){
                window.angleY = v;
            }else{
                window.clipOffset = v;
            }

            clearTimeout(buildHistTimeout);
            buildHistTimeout = setTimeout(() => {
                window.buildFilteredPoints();
            }, 500);
            window.createVolumeShader();
        });

        // Set initial global to 0
        if (axis === "X") window.angleX = 0;
        else window.angleY = 0;

        row.appendChild(slider);
        return row;
    }

    // Append “Rotation X” row
    panel.appendChild(makeSliderRow("X"));
    // Append “Rotation Y” row
    panel.appendChild(makeSliderRow("Y"));
    // Append "Offset w" row
    panel.appendChild(makeSliderRow("W"));

    // Finally, insert the panel into the container
    container.appendChild(panel);
};
