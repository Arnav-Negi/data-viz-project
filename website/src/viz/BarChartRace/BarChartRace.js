// Bar chart race for terrorism. Linear easing between keyframes.
const duration = 200; // duration between keyframes

// number of bars that show
const n = 12;

// number of interpolated keyframes
const k = 20;

const barSize = 45;

const margin = {
    top: 100,
    left: 50,
    right: 30,
    bottom: 0
}

const width = 1200 - margin.left - margin.right;

let ready = false;

const xScale = d3.scaleLinear()
    .domain([0, 20000])
    .rangeRound([0, width]);

const yScale = d3.scaleBand()
    .domain(d3.range(n + 1))
    .rangeRound([0, barSize * (n + 1 + 0.1)])
    .paddingInner(0.1);

const heightChart = barSize * n;

const svg = d3.select('#terror')
    .append('svg')
    .attr('height', heightChart + margin.top + margin.bottom)
    .attr('width', width + margin.left + margin.right)
    .attr('class', 'chart')
    .attr('id', 'chart')
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')')


let color = d3.scaleOrdinal();

const keyframes = [];
let prev, next;

// Initialise chart
let bars = svg.append('g')
    .attr('fill-opacity', 0.8)
    .selectAll('rect');

let labels = svg.append("g")
    .attr('class', 'countryLabels')
    .style("font", "bold 15px \"Helvetica Neue\", Helvetica, Arial, sans-serif")
    .style("font-variant-numeric", "tabular-nums")
    .attr("text-anchor", "end")
    .selectAll("text");

let axis = d3.axisTop(xScale)
    .ticks(width / 160)
    .tickSizeOuter(0)
    .tickSizeInner(-barSize * (n + yScale.padding()));

let g = svg.append("g")

let counter = svg.append("text")
    .style("font", 'bold \"Helvetica Neue\", Helvetica, Arial, sans-serif')
    .style('font-size', '3em')
    .style("font-variant-numeric", "tabular-nums")
    .attr("text-anchor", "end")
    .attr("x", width - 50)
    .attr("y", barSize * (n - 0.45))
    .attr("dy", "0.32em")
    .attr('stroke', 'black')

let xAxisLabel = svg.append("text")
    .style("font", 'bold \"Helvetica Neue\", Helvetica, Arial, sans-serif')
    .style('font-size', '1.5em')
    .style("font-variant-numeric", "tabular-nums")
    .attr("x", width / 2 - 25)
    .attr("y", -30)
    .text("Deaths for this year")

let yAxisLabel = svg.append("text")
    .style("font", 'bold \"Helvetica Neue\", Helvetica, Arial, sans-serif')
    .style('font-size', '1.5em')
    .style("font-variant-numeric", "tabular-nums")
    .attr("x", -heightChart / 2)
    .attr("y", -10)
    .attr("transform", "rotate(-90)")
    .text("Country");


async function play() {
    if (!ready) return;

    for (const keyframe of keyframes) {
        const transition = svg.transition()
            .duration(duration)
            .ease(d3.easeLinear);

        // axis
        updateAxis(axis, transition);

        // bars
        svg.selectAll('rect').remove();
        updateBars(bars, keyframe[1], transition);

        // labels
        svg.selectAll('#countryLabels').remove();
        updateLabels(labels, keyframe[1], transition);

        // counter
        updateCounter(counter, keyframe[0], transition);

        await transition.end();
    }
}

function updateBars(bars, data, transition) {
    bars = bars.data(data, d => d.name)
        .join(
            function (enter) {
                return enter.append('rect')
                    .attr('fill', (d) => color(d.name))
                    .attr('width', d => xScale((prev.get(d) || d).value) - xScale(0))
                    .attr('height', yScale.bandwidth())
                    .attr('y', d => yScale((prev.get(d) || d).rank))
                    .attr('x', xScale(0))
                    .attr('overflow', 'hidden');
            },
            function (update) {
                return update
            },
            function (exit) {
                return exit.transition(transition).remove()
                    .attr('y', d => yScale((next.get(d) || d).rank))
                    .attr('width', d => xScale((next.get(d) || d).value) - xScale(0));
            }
        )
        .call(bar => bar.transition(transition)
            .attr('y', d => yScale(d.rank))
            .attr('width', d => xScale(d.value) - xScale(0))
        );
}

function textTween(a, b) {
    const i = d3.interpolateNumber(a, b);
    return function (t) {
        this.textContent = Math.round(i(t));
    };
}

function updateLabels(labels, data, transition) {
    const prevFunc = (d) => Math.min(xScale((prev.get(d) || d).value), width);
    const nextFunc = (d) => Math.min(xScale((next.get(d) || d).value), width);
    const curFunc = (d) => Math.min(xScale(d.value), width);

    labels = labels.data(data.slice(0, n), d => d.name)
        .join(
            function (enter) {
                return enter.append('text')
                    .attr('id', 'countryLabels')
                    .attr("transform", d => `translate(${prevFunc(d)},${yScale((prev.get(d) || d).rank)})`)
                    .attr("y", yScale.bandwidth() / 2)
                    .attr("x", -6)
                    .attr("dy", "-0.25em")
                    .text(d => d.name)
                    .call(text => text.append("tspan")
                        .attr("fill-opacity", 1)
                        .attr("font-weight", "normal")
                        .attr("x", -6)
                        .attr("dy", "1.15em"))
            },
            function (update) {
                return update
            },
            function (exit) {
                return exit.transition(transition).remove()
                    .attr("transform", d => `translate(${nextFunc(d)},${yScale((next.get(d) || d).rank)})`)
                    .call(g => g.select("tspan").tween("text", d => textTween(d.value, (next.get(d) || d).value)))
            }
        )
        .call(
            bar => bar.transition(transition)
                .attr("transform", d => `translate(${curFunc(d)},${yScale(d.rank)})`)
                .call(g => g.select("tspan").tween("text", d => textTween((next.get(d) || d).value, d.value)))
        );
}

function updateAxis(axis, transition) {
    g.transition(transition).call(axis);
    g.select(".tick:first-of-type text").remove();
    g.selectAll(".tick:not(:first-of-type) line").attr("stroke", "white");
    g.select(".domain").remove();
}

function updateCounter(counter, date, transition) {
    const year = date.getUTCFullYear();
    transition.end().then(() => counter.text(year));
}

function getRank(valueFn, names, n) {
    let data = Array.from(names, name => ({name, value: valueFn(name)}));
    data.sort((a, b) => d3.descending(a.value, b.value));

    let i = 0;
    data.forEach((d) => {
        d.rank = i;

        if (i < n) i++;
    })
    return data;
}


let data = [];
d3.csv("https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/annual-number-of-deaths-by-cause.csv", function (d) {
    if (d.Country.includes('World')) return;
    if (d.Country.includes('WB')) return;
    if (d.Country.includes('Bank')) return;
    if (d.Country.includes('WHO')) return;
    if (d.Country.includes('G20')) return;
    if (d.Country.includes('OECD')) return;

    d.date = new Date(d.Year);
    d.Value = +(d.conflict_and_terrorism);
    data.push({
        country: d.Country,
        date: new Date(d.Year),
        value: +(d.conflict_and_terrorism) || 0
    })
}).then(function () {
    let dataMap = Array.from(d3.rollup(data,
        ([d]) => d.value, d => d.date, d => d.country))
        .sort(([a], [b]) => d3.ascending(a, b));

    const names = new Set(data.map(d => d.country));
    color.domain(Array.from(names)).range(d3.schemePaired);

    // Generate keyframes
    let a, b;
    for (let i = 0; i < dataMap.length - 1; i++) {
        for (let j = 0; j < k; j++) {
            a = dataMap[i];
            b = dataMap[i + 1];
            const t = j / k;

            keyframes.push([
                new Date(b[0] * t + a[0] * (1 - t)),
                getRank(name => (b[1].get(name) || 0) * t + (a[1].get(name) || 0) * (1 - t), names, n)
            ]);
        }
    }
    keyframes.push(
        [dataMap[dataMap.length - 1][0],
            getRank(name => dataMap[dataMap.length - 1][1].get(name) || 0, names, n)]
    );

    const nameframes = d3.groups(keyframes.flatMap(([, data]) => data), d => d.name);
    prev = new Map(nameframes.flatMap(([, data]) => d3.pairs(data, (a, b) => [b, a])));
    next = new Map(nameframes.flatMap(([, data]) => d3.pairs(data)));
    ready = true;
    counter.text(keyframes[0][0].getUTCFullYear());
    console.log(keyframes)
    play();
});