function Histogram(containerSelector, data) {
    this.selector = containerSelector;
    this.data = data;
    this.width = 600;
    this.height = 800;
    this.margin = { top: 20, right: 20, bottom: 400, left: 60 };
    this.binCount = 100;

    this.svg = null;
    this.g = null;

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

        const barYBase = y(0);

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
            .transition()
            .duration(600)
            .attr("height", d => Math.abs(y(d.density) - barYBase));

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
    };

    this.updateData = function (newData) {
        this.data = newData;
        this.render();
    };
}