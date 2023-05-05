function BubbleChart(data, {
    name = ([x]) => x, // alias for label
    label = name, // given d in data, returns text to display on the bubble
    value = ([, y]) => y, // given d in data, returns a quantitative size
    group, // given d in data, returns a categorical value for color
    title, // given d in data, returns text to show on hover
    link, // given a node d, its link (if any)
    linkTarget = "_blank", // the target attribute for links, if any
    width = 640, // outer width, in pixels
    height = width, // outer height, in pixels
    padding = 3, // padding between circles
    margin = 1, // default margins
    marginTop = 0, // top margin, in pixels
    marginRight = 0, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = 0, // left margin, in pixels
    groups, // array of group names (the domain of the color scale)
    colors = d3.schemeTableau10, // an array of colors (for groups)
    fill = "#ccc", // a static fill color, if no group channel is specified
    fillOpacity = 0.7, // the fill opacity of the bubbles
    stroke, // a static stroke around the bubbles
    strokeWidth, // the stroke width around the bubbles, if any
    strokeOpacity, // the stroke opacity around the bubbles, if any
    top10Diseases, // list of top 10 diseases
    bottom6Diseases, // list of bottom 6 diseases
    totalData, // total data
} = {}) {
    // Compute the values.
    const D = d3.map(data, d => d);
    const V = d3.map(data, value);
    const G = group == null ? null : d3.map(data, group);
    const I = d3.range(V.length).filter(i => V[i] > 0);

    // create a dispatch event for tooltip
    const dispatch = d3.dispatch("showTooltip", "hideTooltip");

    // Unique the groups.
    if (G && groups === undefined) groups = I.map(i => G[i]);
    groups = G && new d3.InternSet(groups);

    // Construct scales.
    const color = G && d3.scaleOrdinal(groups, colors);

    // Compute labels and titles.
    const L = label == null ? null : d3.map(data, label);

    console.log('L', L);

    const T = title === undefined ? L : title == null ? null : d3.map(data, title);

    // Compute layout: create a 1-deep hierarchy, and pack it.
    const root = d3.pack()
        .size([width - marginLeft - marginRight, height - marginTop - marginBottom])
        .padding(padding)
        (d3.hierarchy({ children: I })
            .sum(i => V[i]));

    const svg = d3.create("svg")
        .attr("width", width)
        .attr("height", height)
        .attr("viewBox", [-marginLeft, -marginTop, width, height])
        .attr("style", "max-width: 100%; height: auto; height: intrinsic;")
        .attr("fill", "currentColor")
        .attr("font-size", 10)
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "middle");

    const leaf = svg.selectAll("a")
        .data(root.leaves())
        .join("a")
        .attr("xlink:href", link == null ? null : (d, i) => link(D[d.data], i, data))
        .attr("target", link == null ? null : linkTarget)
        .attr("transform", d => `translate(${d.x},${d.y})`);

    leaf.append("circle")
        .attr("id", (d, i) => {
            return `bubble-${i}`
        })
        .attr("stroke", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
        .attr("fill-opacity", fillOpacity)
        .attr("r", d => d.r);

    leaf.on("mouseover", function (d, i) {
        console.log('this', d, i);
        // get circle id    
        const circleId = this.children[0].attributes.id.value;
        console.log('circleId', circleId);
        // decrease opacity of all other circles with 1s transition
        transitionOpacity(d3.selectAll("circle").filter(function (d) {
            return d.data !== i.data;
        }), 0.3, 500);

        // hide all other text with 1s transition
        transitionOpacity(d3.selectAll(".bubble-text").filter(function (d) {
            return d.data !== i.data;
        }), 0.2, 500);

        // get the text id  
        const textId = this.children[1].attributes.id.value;
        console.log('textId', textId);

        // change font size of tspans inside text element
        transitionFontSize(d3.selectAll(`#${textId} tspan`), 20, 500);
    
        textEl = d3.select(`#${textId}`)

        console.log('textEl', textEl);

        data = D.filter(function (d) {
            return d.value === i.value;
        })[0];

        console.log('data', data);

        dispatch.call("showTooltip", this, data, i);
    });

    leaf.on("mouseout", function (d) {
        // reset opacity of all circles
        transitionOpacity(d3.selectAll("circle"), 1, 500);
        transitionOpacity(d3.selectAll(".bubble-text"), 1, 500);
        transitionFontSize(d3.selectAll("tspan"), 12, 500);
    })

    if (L) {
        leaf.append("text")
            .attr("id", (d, i) => {
                return `text-${i}`
            })
            .attr("class", "bubble-text")
            .selectAll("tspan")
            .data(d => `${L[d.data]}`.split(/\n/g))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
            .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.9 : null)
            .text(d => {
                // increase font size for top 10 diseases
                if (top10Diseases.includes(d)) {
                    return d;
                }
                if (d.length > 12) {
                    return d.slice(0, 12) + '...';
                }
                return d;
            })
            .attr("font-size", 12)
    }


    const tooltip = svg.append("g")
    .attr("id", "tooltip")
    .attr("transform", `translate(${width/2 - margin/2}, ${height - margin + 10})`)

    const rect = tooltip.append("rect")
    .attr("width", 300)
    .attr("height", 70)
    .attr("stroke", "black")
    .attr("stroke-width", 1)
    .attr("opacity", 0.4)
    .attr("rx", 10)
    .attr("ry", 10);

    


    // dispatch event definition
    dispatch.on("showTooltip", function (d, i) {

        d3.select("#tooltipRect")
        .remove();

        // add this to a new tooltip component in the bottom center of the svg
        const tooltipRect = tooltip.append("g")
        .attr("id", "tooltipRect")

        tooltipRect.append("text")
        .attr("x", 150)
        .attr("y", 25)
        .attr("font-size", 15)
        .text(d.name);

        // change bg color of tooltip rectange based on the color of the circle
        rect.attr("fill", color(G[i.data]));

        // add commas to the value
        const value = d.value.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

        tooltipRect.append("text")
        .attr("x", 150)
        .attr("y", 50)
        .attr("font-size", 15)
        .attr('opacity', 0.7)
        .text(value);

    });

    return Object.assign(svg.node(), { scales: { color } });
}

const getData = async () => {
    const res = await d3.csv('https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/cause_of_deaths.csv');
    return res;
}

getData().then((data) => {
    console.log(data.columns);
    const diseases = data.columns.slice(3);
    console.log(diseases);
    // create object with "name" as disease and "value" as total deaths
    diseaseData = diseases.map(disease => {
        let total = 0;
        data.forEach(row => {
            total += +row[disease];
        });
        return { name: disease, value: total };
    });
    console.log(diseaseData);

    // create a more detailed onject with name as disease, and deaths for each year
    expandedDiseaseData = diseases.map(disease => {
        let total = 0;
        let deaths = {};
        for (let i = 1990; i < 2020; i++) {
            deaths[i] = 0;
        }
        data.forEach(row => {
            total += +row[disease];
            deaths[row.Year] += +row[disease];
        });
        return { name: disease, value: total, deaths: deaths };
    });

    console.log(expandedDiseaseData);

    // sort diseaseData by value
    diseaseData.sort((a, b) => b.value - a.value);

    // get top 10 disease names
    const top10Diseases = diseaseData.slice(0, 10).map(disease => disease.name);

    console.log(top10Diseases);

    // get bottom 6 disease names
    const bottom6Diseases = diseaseData.slice(-6).map(disease => disease.name);

    chart = BubbleChart(diseaseData, {
        value: d => d.value,
        group: d => d.name,
        label: d => `${d.name}\n${d.value.toLocaleString("en")}`,
        padding: 5,
        strokeWidth: 2,
        fillOpacity: 0.6,
        width: 1000,
        top10Diseases: top10Diseases,
        bottom6Diseases: bottom6Diseases,
        margin: 300,
        totalData: expandedDiseaseData
    });

    document.getElementById('db_chart').appendChild(chart);
})

function transitionOpacity(selection, opacity, duration) {
    selection.transition()
        .duration(duration)
        .style("opacity", opacity);
}

function transitionFontSize(selection, fontSize, duration) {
    selection.transition()
        .duration(duration)
        .attr("font-size", fontSize);
}