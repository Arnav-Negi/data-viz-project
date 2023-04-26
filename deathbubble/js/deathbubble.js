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
    marginTop = margin, // top margin, in pixels
    marginRight = margin, // right margin, in pixels
    marginBottom = margin, // bottom margin, in pixels
    marginLeft = margin, // left margin, in pixels
    groups, // array of group names (the domain of the color scale)
    colors = d3.schemeTableau10, // an array of colors (for groups)
    fill = "#ccc", // a static fill color, if no group channel is specified
    fillOpacity = 0.7, // the fill opacity of the bubbles
    stroke, // a static stroke around the bubbles
    strokeWidth, // the stroke width around the bubbles, if any
    strokeOpacity, // the stroke opacity around the bubbles, if any
    top10Diseases, // list of top 10 diseases
    bottom6Diseases, // list of bottom 6 diseases
} = {}) {
    // Compute the values.
    const D = d3.map(data, d => d);
    const V = d3.map(data, value);
    const G = group == null ? null : d3.map(data, group);
    const I = d3.range(V.length).filter(i => V[i] > 0);

    console.log('I', I);

    // Unique the groups.
    if (G && groups === undefined) groups = I.map(i => G[i]);
    groups = G && new d3.InternSet(groups);

    // Construct scales.
    const color = G && d3.scaleOrdinal(groups, colors);

    // Compute labels and titles.
    const L = label == null ? null : d3.map(data, label);
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
        .attr("stroke", stroke)
        .attr("stroke-width", strokeWidth)
        .attr("stroke-opacity", strokeOpacity)
        .attr("fill", G ? d => color(G[d.data]) : fill == null ? "none" : fill)
        .attr("fill-opacity", fillOpacity)
        .attr("r", d => d.r)
        .on("mouseover", function(d, i) {
            console.log('this', this.attributes.id);
            console.log('d', d);
            console.log('i', i);
            // decrease opacity of all other circles with 1s transition
            transitionOpacity(d3.selectAll("circle").filter(function(d) {
                return d.data !== i.data;
            }), 0.5, 500);
            
            // tippy
            tippy(`#bubble-${this.attributes.id.value}`, {
                content: "Hello, world!"
            });
        })
        .on("mouseout", function(d) {
            // reset opacity of all circles
            transitionOpacity(d3.selectAll("circle"), 1, 500);
        });

    if (T) leaf.append("title")
        .text(d => T[d.data])
        .attr("background-color", "white");

    if (L) {
        leaf.append("text")
            .selectAll("tspan")
            .data(d => `${L[d.data]}`.split(/\n/g))
            .join("tspan")
            .attr("x", 0)
            .attr("y", (d, i, D) => `${i - D.length / 2 + 0.85}em`)
            .attr("fill-opacity", (d, i, D) => i === D.length - 1 ? 0.7 : null)
            .text(d => {
                // increase font size for top 10 diseases

                if (top10Diseases.includes(d)) {
                    return d;
                }
                if (bottom6Diseases.includes(d)) {
                    return '';
                }
                if (d.length > 15) {
                    return d.slice(0, 15) + '...';
                }
                return d;
            })
            .attr("font-size", (d) => {
                if (top10Diseases.includes(d)) {
                    return 20;
                }
                return 15;
            });
    }

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
        return {name: disease, value: total};
    });
    console.log(diseaseData);

    // sort diseaseData by value
    diseaseData.sort((a, b) => b.value - a.value);

    // get top 10 disease names
    const top10Diseases = diseaseData.slice(0, 10).map(disease => disease.name);

    console.log(top10Diseases);

    // get bottom 6 disease names
    const bottom6Diseases = diseaseData.slice(-6).map(disease => disease.name);
    // get bottom 6 disease values
    const bottom6DiseasesValues = diseaseData.slice(-6).map(disease => disease.value);

    chart = BubbleChart(diseaseData, {
        value: d => d.value,
        group: d => d.name,
        label: d => `${d.name}\n${d.value.toLocaleString("en")}`,
        stroke: "#000",
        padding: 3,
        strokeWidth: 1,
        fillOpacity: 0.7,
        width: 1200,
        height: 1200,
        top10Diseases: top10Diseases,
        bottom6Diseases: bottom6Diseases,
        bottom6DiseasesValues: bottom6DiseasesValues
    });

    document.getElementById('chart').appendChild(chart);
})

function transitionOpacity(selection, opacity, duration) {
    selection.transition()
        .duration(duration)
        .style("opacity", opacity);
}

function resetOpacity(selection) {
    selection.style("opacity", 1);
}