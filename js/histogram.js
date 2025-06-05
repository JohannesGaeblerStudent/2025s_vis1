window.selectors = []

function Histogram(containerSelector, data) {
    this.selector = containerSelector;
    this.data = data;
    this.width = 600;
    this.height = 800;
    this.margin = { top: 20, right: 20, bottom: 400, left: 60 };
    this.binCount = 100;

    this.svg = null;
    this.g = null;

    const picker = new PickerPanel(
        (updatedSelector) => {
            this.setColorSteps();
            this.render();
            paint();
        },
        (deletedSelector) => {
            window.selectors = window.selectors.filter(s => s !== deletedSelector);
            this.resetColorSteps();
            this.setColorSteps();
            this.render();
            paint();
        }
    );

    this.render = function () {
        const total = this.data.length;

        const x = d3.scaleLinear()
            .domain([0, 1])
            .range([0, this.width - this.margin.left - this.margin.right]);

        const bins = d3.bin()
            .domain(x.domain())
            .thresholds(this.binCount)(this.data);

        bins.forEach(bin => {
            bin.density = bin.length / total;
        });

        const y = d3.scalePow()
            .exponent(0.3)
            .domain([1, 0])
            .range([0, this.height - this.margin.top - this.margin.bottom]);

        const innerWidth = this.width - this.margin.left - this.margin.right;
        const innerHeight = this.height - this.margin.top - this.margin.bottom;
        const barYBase = y(0);

        if (!this.svg) {
            this.svg = d3.select(this.selector)
                .append("svg")
                .attr("width", this.width)
                .attr("height", this.height);

            this.g = this.svg.append("g")
                .attr("transform", `translate(${this.margin.left},${this.margin.top})`);

            // Axis labels
            this.g.append("text")
                .attr("class", "x-label")
                .attr("x", innerWidth)
                .attr("y", innerHeight + 30)
                .attr("text-anchor", "end")
                .style("fill", "white")
                .text("Density");

            this.g.append("text")
                .attr("class", "y-label")
                .attr("transform", "rotate(-90)")
                .attr("x", 0)
                .attr("y", -20)
                .attr("dy", "-1em")
                .attr("text-anchor", "end")
                .style("fill", "white")
                .text("Intensity");
        }

        // Join
        const bars = this.g.selectAll("rect")
            .data(bins, d => d.x0);

        // Exit
        bars.exit()
            .transition()
            .duration(600)
            .attr("y", barYBase)
            .attr("height", 0)
            .remove();

        // Update
        bars.transition()
            .duration(600)
            .attr("x", d => x(d.x0) + 1)
            .attr("y", barYBase)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
            .attr("height", d => Math.abs(y(d.density) - barYBase))
            .attr("fill", "#888");

        // Enter
        bars.enter().append("rect")
            .attr("x", d => x(d.x0) + 1)
            .attr("y", barYBase)
            .attr("width", d => Math.max(0, x(d.x1) - x(d.x0) - 2))
            .attr("height", 0)
            .attr("fill", "#888")
            .lower()
            .on("click", (event, d) => {
                const index = bins.findIndex(b => b.x0 === d.x0);
                if (window.selectors.length === 10) {
                    window.alert('Only 10 selectors allowed');
                }
                else if (!window.selectors.find(s => s.index === index)) {
                    window.selectors.push({ index, color: '#ffffff', opacity: 1.0 });
                    this.setColorSteps();
                    this.render();
                    paint();
                }
            })
            .transition()
            .duration(600)
            .attr("height", d => Math.abs(y(d.density) - barYBase));

        this.g.selectAll(".x-axis").remove();
        this.g.selectAll(".y-axis").remove();

        this.g.append("g")
            .attr("class", "x-axis")
            .attr("transform", `translate(0,${innerHeight})`)
            .call(d3.axisBottom(x).ticks(10));

        this.g.append("g")
            .attr("class", "y-axis")
            .call(d3.axisLeft(
                d3.scaleLinear()
                    .domain([0, 1])
                    .range([innerHeight, 0])
            ).ticks(10));

        this.g.selectAll(".selector-group").remove();

        const selectorGroups = this.g.selectAll(".selector-group")
            .data(window.selectors)
            .enter()
            .append("g")
            .attr("class", "selector-group")
            .call(d3.drag()
                .on("drag", (event, d) => {
                    // X-axis = density
                    const stepWidth = x(bins[1].x0) - x(bins[0].x0);
                    const newIndex = Math.round(event.x / stepWidth);
                    d.index = Math.max(0, Math.min(bins.length - 1, newIndex));

                    // Y-axis = opacity
                    const clampedY = Math.max(0, Math.min(innerHeight, event.y));
                    const newOpacity = 1.0 - (clampedY / innerHeight);
                    d.opacity = Math.max(0, Math.min(1, newOpacity));

                    this.setColorSteps();
                    this.render();
                    paint();
                }));

        selectorGroups.append("circle")
            .attr("r", 8)
            .attr("fill", d => d.color)
            .attr("fill-opacity", 1)
            .attr("cx", d => (x(bins[d.index].x0) + x(bins[d.index].x1)) / 2)
            .attr("cy", d => {
                const innerHeight = this.height - this.margin.top - this.margin.bottom;
                return innerHeight * (1 - d.opacity);
            })
            .style("cursor", "pointer")
            .on("click", (event, d) => {
                event.stopPropagation();
                picker.show(event.pageX, event.pageY, d);
            });

        selectorGroups.append("line")
            .attr("x1", d => (x(bins[d.index].x0) + x(bins[d.index].x1)) / 2)
            .attr("x2", d => (x(bins[d.index].x0) + x(bins[d.index].x1)) / 2)
            .attr("y1", innerHeight)
            .attr("y2", d => {
                const innerHeight = this.height - this.margin.top - this.margin.bottom;
                return innerHeight * (1 - d.opacity);
            })
            .attr("stroke", d => d.color)
            .attr("stroke-opacity", 1)
            .attr("stroke-width", 2);
    };

    this.updateData = function (newData) {
        this.data = newData;
        this.render();
    };

    this.resetData = function (newData) {
        this.data = newData;
        window.selectors = [];
        this.resetColorSteps();
        this.render();
    };

    this.setColorSteps = function () {
        let i = 0;
        for (let selector of window.selectors.sort((a, b) => b.index - a.index)) {
            window.volumeContext.setColorStep(i, selector.index / 100, hexToRgb(selector.color), selector.opacity);
            i++;
        }
    };

    this.resetColorSteps = function () {
        for (let i = 0; i < 9; i++) {
            window.volumeContext.setColorStep(i, 1.0, new THREE.Vector4(), 0.0);
        }
    }
}

function hexToRgb(hex) {
    let result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16) / 255,
        g: parseInt(result[2], 16) / 255,
        b: parseInt(result[3], 16) / 255
    } : null;
}

