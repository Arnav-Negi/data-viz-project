var margin = { top: 80, right: 100, bottom: 30, left: 300 },
    width = 1150 - margin.left - margin.right,
    height = 550 - margin.top - margin.bottom;

var svg = d3.select("#world_map")
    .append("svg")
    .attr("width", width + margin.left + margin.right + 200)
    .attr("height", height + margin.top + margin.bottom + 140)
    .append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");

const projection = d3.geoNaturalEarth1()
    .scale(width / 1.3 / Math.PI)
    .translate([width / 2, height / 2])

let year = 2019;

const colorScale = d3.scaleSequential()
    .domain([30, 200])
    .interpolator(d3.interpolateBlues);

const legendGradient = svg.append("defs")
    .append("linearGradient")
    .attr("id", "legendGradient")
    .attr("x1", "0%")
    .attr("y1", "0%")
    .attr("x2", "100%")
    .attr("y2", "0%");

legendGradient.selectAll("stop")
    .data(d3.range(0, 1.1, 0.1))
    .enter().append("stop")
    .attr("offset", function (d) { return d * 100 + "%"; })
    .attr("stop-color", function (d) { return colorScale(d * 200 + 50); });

svg.append("rect")
    .attr("x", 260)
    .attr("y", 550)
    .attr("width", 300)
    .attr("height", 30)
    .style("fill", "url(#legendGradient)")
    .attr("stroke", "black")
    .style("stroke-width", "1px");

svg.append("text")
    .attr("x", 230)
    .attr("y", 570)
    .text("0");

svg.append("text")
    .attr("x", 580)
    .attr("y", 570)
    .text("200");

d3.json("https://raw.githubusercontent.com/holtzy/D3-graph-gallery/master/DATA/world.geojson").then(function (geoData) {
    d3.csv("https://raw.githubusercontent.com/himanibelsare/data-vis-files/main/death-rate-smoking.csv").then(function (data) {

        function updateMap() {
            const joinedData = geoData.features.map(function (feature) {
                const countryCode = feature.id;
                // console.log(countryCode);
                const countryData = data.find(function (d) {
                    return d.Code === countryCode && d.Year == year;
                });
                feature.properties.data = countryData ? +countryData.Deaths : 0;
                // console.log(feature)
                return feature;
            });


            svg.selectAll("path")
                .data(joinedData)
                .join("path")
                .attr("fill", function (d) { return colorScale(d.properties.data); })
                .attr("d", d3.geoPath()
                    .projection(projection)
                )
                .attr("stroke", "#fff")
                .on("mouseover", function (d, i) {
                    d3.select(this)
                        .attr("stroke", "black")
                        .attr("stroke-width", "2px")
                    let tooltipContent =
                        "Country: " + i.properties.name + "<br>" +
                        "Country Code: " + i.id + "<br>" +
                        "Deaths: " + i.properties.data;

                    tippy(this, {
                        content: tooltipContent,
                        allowHTML: true
                    });

                })
                .on("mouseout", function (d, i) {
                    d3.select(this)
                        .attr("stroke", "none");
                });
        }

        updateMap();

        d3.select("#year-slider").on("input", function () {
            year = this.value;
            d3.select("#year-label").text("Year: " + year);
            updateMap();
        });
    });
});