document.addEventListener('DOMContentLoaded', () => {
    const req = new XMLHttpRequest();
    req.open("GET", "https://raw.githubusercontent.com/FreeCodeCamp/ProjectReferenceData/master/global-temperature.json", true);
    req.send();
    req.onload = () => drawChart(JSON.parse(req.responseText));
});

const drawChart = ({
    baseTemperature,
    monthlyVariance
}) => {
    const margin = {
            top: 50,
            right: 50,
            bottom: 100,
            left: 100
        },
        width = 1600 - margin.left - margin.right, 
        height = 500 - margin.top - margin.bottom;
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    const maxTempRange = d3.extent(monthlyVariance, d => d.variance).map(v => v + baseTemperature);
    const colors = ["#67001f", "#b2182b", "#d6604d", "#f4a582", "#fddbc7", "#f7f7f7", "#d1e5f0", "#92c5de", "#4393c3", "#2166ac", "#053061"];

    let years = monthlyVariance.map(v => v.year)
        .filter((v, i, array) => array.indexOf(v) == i ? true : false)
    //Scales
    const xScale = d3.scaleLinear()
        .domain(d3.extent(monthlyVariance, v => v.year))
        .range([0, width])
    const yScale = d3.scaleBand()
        .domain([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11])
        .range([0, height])
        .align([0.5]);
    const colorScale = d3.scaleQuantile()
        .domain(maxTempRange)
        .range(colors.reverse());
    //cell sizes
    const cellWidth = xScale(monthlyVariance[0].year + 1) - xScale(monthlyVariance[0].year)
    const cellHeight = yScale(monthlyVariance[0].month) - yScale(monthlyVariance[0].month - 1);

    const header = d3.select("body")
        .append("header");
    header.append("h1")
        .attr("id", "title")
        .text("Monthly Global Land-Surface Temperature");
    header.append("h2")
        .attr("id", "description")
        .text(d3.extent(monthlyVariance, d => d.year).join(" - ") + " base temperature: " + baseTemperature + "℃");

    //Svg
    const svg = d3.select("body")
        .append("main")
        .classed('chart-container', true)
        .append("svg")
        .classed('chart', true)
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    //Axis x
    const xAxis = d3.axisBottom(xScale)
    svg.append("g")
        .attr("id", "x-axis")
        .attr("transform", "translate(0, " + height + ")")
        .call(xAxis)
    //Axis y
    const yAxis = d3.axisLeft(yScale)
        .tickValues(yScale.domain())
        .tickFormat(v => months[v])
    svg.append("g")
        .attr("id", "y-axis")
        .attr("transform", "translate(0, 0)")
        .call(yAxis)

    //Cells 
    const cells = svg.append("g")
        .attr("transform", "translate(1,0)")
        .selectAll(".month-rect")
        .data(monthlyVariance)
        .enter()
        .append("rect")
        .classed("cell", true)
        .attr("x", d => xScale(d.year))
        .attr("y", d => yScale(d.month - 1))
        .attr("width", cellWidth)
        .attr("height", cellHeight)
        .attr("fill", d => colorScale(d.variance + baseTemperature))
        .attr("data-month", d => d.month - 1)
        .attr("data-year", d => d.year)
        .attr("data-temp", d => d.variance)
        .on("mousemove", d => {
            tooltip
                .attr("data-year", d.year)
                .style("left", d3.event.pageX - 50 + "px")
                .style("top", d3.event.pageY - 70 + "px")
                .style("display", "inline-block")
                .html(d.year + " - " + months[d.month - 1] +
                    "<br/>" + Math.round((baseTemperature + d.variance) * 100) / 100 +
                    "<br/>" + Math.round((0 - d.variance) * 100) / 100)
        })
        .on("mouseout", d => {
            tooltip.style("display", "none")
        });

    //Legend
    const legendGridSize = 25;
    const legendYPosition = height + margin.bottom / 3;
    const legendScale = d3.scaleLinear()
        .domain(d3.extent(maxTempRange))
        .range([0, colors.length * legendGridSize]);
    const legendAxis = d3.axisBottom(legendScale);
    svg.append("g")
        .attr("id", "legend-axis")
        .attr("transform", "translate(0, " + (legendYPosition + legendGridSize) + ")")
        .call(legendAxis);

    svg.append("g")
        .attr("id", "legend")
        .attr("transform", "translate(0, " + legendYPosition + ")")
        .selectAll("rect")
        .data(colors)
        .enter()
        .append("rect")
        .attr("x", (d, i) => i * legendGridSize)
        .attr("y", 0)
        .attr("width", legendGridSize)
        .attr("height", legendGridSize)
        .attr("fill", d => d);

    //Toltip 
    const tooltip = d3.select("body")
        .append("div")
        .attr("id", "tooltip")

}