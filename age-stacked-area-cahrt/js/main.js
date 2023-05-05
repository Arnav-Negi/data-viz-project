// Copyright 2021 Observable, Inc.
// Released under the ISC license.
// https://observablehq.com/@d3/stacked-area-chart
function StackedAreaChart(data, {
    x = ([x]) => x, // given d in data, returns the (ordinal) x-value
    y = ([, y]) => y, // given d in data, returns the (quantitative) y-value
    z = () => 1, // given d in data, returns the (categorical) z-value
    marginTop = 30, // top margin, in pixels
    marginRight = 30, // right margin, in pixels
    marginBottom = 150, // bottom margin, in pixels
    marginLeft = 70, // left margin, in pixels
    width = 1000, // outer width, in pixels
    height = 700, // outer height, in pixels
    xType = d3.scaleUtc, // type of x-scale
    xDomain, // [xmin, xmax]
    xRange = [marginLeft, width - marginRight], // [left, right]
    yType = d3.scaleLinear, // type of y-scale
    yDomain, // [ymin, ymax]
    yRange = [height - marginBottom, marginTop], // [bottom, top]
    zDomain, // array of z-values
    offset = d3.stackOffsetDiverging, // stack offset method
    order = d3.stackOrderNone, // stack order method
    xFormat, // a format specifier string for the x-axis
    yFormat, // a format specifier for the y-axis
    yLabel, // a label for the y-axis
    colors = d3.schemeTableau10, // array of colors for z
} = {}) {
    // Compute values.
    const X = d3.map(data, x);
    const Y = d3.map(data, y);
    const Z = d3.map(data, z);

    const yearGroup = d3.group(data, d => d.year, d => d.age);

    // Compute default x- and z-domains, and unique the z-domain.
    if (xDomain === undefined) xDomain = d3.extent(X);
    if (zDomain === undefined) zDomain = Z;

    zDomain = new d3.InternSet(zDomain);
    // Omit any data not present in the z-domain.

    const I = d3.range(X.length).filter(i => zDomain.has(Z[i]));
    // Compute a nested array of series where each series is [[y1, y2], [y1, y2],
    // [y1, y2], …] representing the y-extent of each stacked rect. In addition,
    // each tuple has an i (index) property so that we can refer back to the
    // original data point (data[i]). This code assumes that there is only one
    // data point for a given unique x- and z-value.

    const series = d3.stack()
        .keys(zDomain)
        .value(([x, I], z) => Y[I.get(z)])
        .order(order)
        .offset(offset)
        (d3.rollup(I, ([i]) => i, i => X[i], i => Z[i]))
        .map(s => s.map(d => Object.assign(d, {i: d.data[1].get(s.key)})));

    // Compute the default y-domain. Note: diverging stacks can be negative.
    if (yDomain === undefined) yDomain = d3.extent(series.flat(2));
    yDomain[1] *= 1.1;

    // Construct scales and axes.
    const xScale = xType(xDomain, xRange);
    const yScale = yType(yDomain, yRange);
    const color = d3.scaleOrdinal(zDomain, colors);
    const xAxis = d3.axisBottom(xScale).ticks(width / 80, xFormat);
    const yAxis = d3.axisLeft(yScale).ticks(height / 50, yFormat);

    const area = d3.area()
        .x(({i}) => xScale(X[i]))
        .y0(([y1]) => yScale(y1))
        .y1(([, y2]) => yScale(y2));

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [0, 0, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .style("-webkit-tap-highlight-color", "transparent")
        .style("overflow", "visible");

    svg.append("g")
        .attr("transform", `translate(${marginLeft},0)`)
        .call(yAxis)
        .call(g => g.select(".domain").remove())
        .call(g => g.selectAll(".tick line").clone()
            .attr("x2", width - marginLeft - marginRight)
            .attr("stroke-opacity", 0.1))
        .call(g => g.append("text")
            .attr("x", -marginLeft)
            .attr("y", 10)
            .attr("fill", "currentColor")
            .attr("text-anchor", "start")
            .attr("font-size", "15px")
            .text(yLabel));


    const paths = svg.append("g")
        .selectAll("path")
        .data(series)
        .join("path")
        .attr('class', 'area')
        .attr("fill", ([{i}]) => color(Z[i]))
        .attr("d", area)
        .attr('opacity', 0.8)
        .on("mouseover", function (event, d) {
            d3.select(this).attr('opacity', 1)
        })
        .on('mouseout', function (event, d) {
            d3.select(this).attr('opacity', 0.8);
        })
        .on("pointerenter pointermove", pointermoved)
        .on("pointerleave", pointerleft)
        .on("touchstart", event => event.preventDefault());

    paths.append("title")
        .text(([{i}]) => 'age range: ' + Z[i]);

    svg.append("g")
        .attr("transform", `translate(0,${height - marginBottom})`)
        .call(xAxis);

    // Legend
    const legend = svg.append("g")
        .selectAll("g")
        .data(zDomain)
        .join('rect')
        .attr('x', (d, i) => marginLeft + i * 150)
        .attr('y', height - 2 * marginBottom / 3)
        .attr('width', 30)
        .attr('height', 30)
        .attr("fill", (d, i) => color(d))
        .attr('opacity', 0.8);


    const legendText = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12)
        .selectAll("g")
        .data(zDomain)
        .join('text')
        .attr('x', (d, i) => i * 150 + marginLeft + 40)
        .attr('y', height - 2 * marginBottom /3 + 20)
        .text(d => d + ' years')
        .attr("fill", (d,  i) => color(d));

    // Tooltip
    const tooltip = svg.append("g")
        .style("pointer-events", "none");

    const tooltipLine = svg.append('g')
        .attr('class', 'tooltip-line');

    function pointermoved(event) {
        let i = Math.round(xScale.invert(d3.pointer(event)[0]));
        if (i < 1990) i = 1990;
        if (i > 2019) i = 2019;


        tooltip.style("display", null);
        tooltip.attr("transform", `translate(${d3.pointer(event)[0]},${d3.pointer(event)[1]})`);

        tooltip.selectAll("text").remove();

        const text = tooltip.selectAll("text")
            .data(ageRanges)
            .join("text")
            .attr("dy", "0.35em")
            .attr("x", 10)
            .attr("y", (d, i) => (i + 1) * 20)
            .text((d) => {
                return `${d} years: ${yearGroup.get(i).get(d)[0].deaths}`;
            });

        tooltip.append("text")
            .attr("dy", "0.35em")
            .attr("x", 10)
            .attr("y", 0)
            .text('year: ' + i + ' (DALYs)');

        tooltipLine.selectAll('line').remove();
        tooltipLine.append('line')
            .attr('x1', xScale(i))
            .attr('x2', xScale(i))
            .attr('y1', 0)
            .attr('y2', height - marginBottom)
            .attr('stroke', 'black')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', 5);
    }

    function pointerleft() {
        tooltip.selectAll("text").remove();
        tooltipLine.selectAll('line').remove();
        svg.node().value = null;
        svg.dispatch("input", {bubbles: true});
    }

    return Object.assign(svg.node(), {scales: {color}});
}

const ageRanges = ['>70','50-69','15-49','5-14','<5']
const dataArray = []
const countries = new Set();

function build(country) {
    const chart = document.getElementById('chart');
    chart.innerHTML = '';
    chart.append(StackedAreaChart(dataArray.filter((d) => d.country === country), {
        x: (d) => d.year,
        y: (d) => d.deaths,
        z: (d) => d.age,
        xType: d3.scaleLinear,
        xFormat: d3.format("d"),
        yLabel: 'DALYs',
    }));
}

function buildHelper(selectObject) {
    build(selectObject.value);
}

d3.csv('https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/number-of-deaths-by-age-group.csv', (d) => {
    ageRanges.forEach((age) => {
        dataArray.push({
            country: d.country,
            year: +d.year,
            age: age,
            deaths: +d[age]
        })
    });

    countries.add(d.country);
}).then(
    (data) => {
        // add select options
        const element = document.getElementById('select');

        countries.forEach(country => {
            const option = document.createElement('option')
            option.value = country;
            option.text = country;
            element.appendChild(option);
        })

        build('India');
    }
)