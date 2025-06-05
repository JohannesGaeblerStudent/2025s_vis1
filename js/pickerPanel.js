function PickerPanel(onChange, onDelete) {
    this.panel = document.createElement('div');
    this.panel.className = 'picker-panel';
    this.panel.style.position = 'absolute';
    this.panel.style.background = '#222';
    this.panel.style.border = '1px solid #555';
    this.panel.style.padding = '10px';
    this.panel.style.display = 'none';
    this.panel.style.color = '#fff';
    this.panel.style.zIndex = '1000';
    this.panel.style.borderRadius = '8px';

    const colorLabel = document.createElement('label');
    colorLabel.textContent = 'Color: ';
    colorLabel.style.marginRight = '10px';

    const colorInput = document.createElement('input');
    colorInput.type = 'color';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close';
    closeButton.style.marginTop = '8px';

    const deleteButton = document.createElement('button');
    deleteButton.textContent = 'Delete';
    deleteButton.style.marginLeft = '8px';

    colorLabel.appendChild(colorInput);
    this.panel.appendChild(colorLabel);
    this.panel.appendChild(document.createElement('br'));
    this.panel.appendChild(closeButton);
    this.panel.appendChild(deleteButton);

    document.body.appendChild(this.panel);

    let currentSelector = null;

    colorInput.addEventListener('input', () => {
        if (currentSelector) {
            currentSelector.color = colorInput.value;
            onChange?.(currentSelector);
        }
    });

    closeButton.addEventListener('click', () => {
        this.hide();
    });

    deleteButton.addEventListener('click', () => {
        if (currentSelector) {
            onDelete?.(currentSelector);
            this.hide();
        }
    });

    this.show = (x, y, selector) => {
        currentSelector = selector;
        colorInput.value = selector.color;

        this.panel.style.left = `${x + 10}px`;
        this.panel.style.top = `${y - 10}px`;
        this.panel.style.display = 'block';
    };

    this.hide = () => {
        this.panel.style.display = 'none';
        currentSelector = null;
    };
}
