const getData = async () => {
    const res = await d3.csv('https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/deaths_health_gdp.csv');
    return res;
}

getData().then((data) => {
    console.log(data.columns);
    console.log(data);

    // change data types
    data.forEach((d) => {
        d.year = +d.year;
        d.gdp = +d.gdp;
        d.exp = +d.exp;
        d.death_rate = +d.death_rate;
    });

    continents = ["Africa", "Asia", "Europe", "North America", "Oceania", "South America"];

    // remove data for "world"
    data = data.filter(d => d.country != "World");

    // remove data where death rate is 0
    data = data.filter(d => d.death_rate > 0);

    // get countries starting with r
    console.log(data.filter(d => d.country.startsWith("R")));

    years = d3.extent(data, d => d.year);
    console.log("years:", years);

    data = data.filter(d => {
        if (d.gdp > 0 && d.exp > 0) {
            return d;
        }
    });

    height = 600;
    width = 1000;
    margin = ({ top: 20, right: 200, bottom: 20, left: 50 });

    const yearFilter = Scrubber(
        d3.range(years[0], years[1] + 1, 1),
        {
            autoplay: false, delay: 1200, loop: false
        }
    );

    console.log(yearFilter)

    const output = yearFilter._groups[0][0][2];
    let yearToDisplay = output.value;
    console.log(typeof yearToDisplay);


    x = d3.scaleLog()
        .domain(d3.extent(data.filter(d => d.year == yearToDisplay), d => d.gdp))
        .range([margin.left, width - margin.right])
        .nice();

    y = d3.scaleLog()
        .domain(d3.extent(data.filter(d => d.year == yearToDisplay), d => d.exp))
        .range([height - margin.bottom, margin.top])
        .nice();

    color = d3.scaleOrdinal()
        .domain(data.filter(d => d.year == yearToDisplay).map(d => d.continent))
        .range(d3.schemeTableau10);

    // generate colors for continents
    colorContinents = {};
    continents.forEach((c) => {
        colorContinents[c] = color(c);
    });

    console.log("colorContinents:", colorContinents);

    death_extent = d3.extent(data.filter(d => d.year == yearToDisplay), d => d.death_rate)
    console.log("death_extent:", death_extent);

    size = d3.scaleSqrt()
        .domain(death_extent)
        .range([1, 10]);

    // append to dom
    const yearScrubber = document.getElementById('scrubber');
    yearScrubber.appendChild(yearFilter.node());

    // yearFilter is a form element. extract the value from it
    yearFilter.node().addEventListener('input', () => {
        // get the value from the form element
        yearToDisplay = output.value;

        // update scales
        x = d3.scaleLog()
            .domain(d3.extent(data.filter(d => d.year == yearToDisplay), d => d.gdp))
            .range([margin.left, width - margin.right])
            .nice();

        y = d3.scaleLog()
            .domain(d3.extent(data.filter(d => d.year == yearToDisplay), d => d.exp))
            .range([height - margin.bottom, margin.top])
            .nice();

        size = d3.scaleSqrt()
            .domain(d3.extent(data.filter(d => d.year == yearToDisplay), d => d.death_rate))
            .range([1, 10]);

    });

    const graph = () => {
        const svg = d3.create("svg")
            .attr("width", width)
            .attr("height", height)

        // x-axis
        svg.append("g")
            .attr("transform", `translate(0,${height - margin.bottom})`)
            .attr("class", "x-axis")
            .call(d3.axisBottom(x))
            .append("text")
            .attr('text-anchor', 'end')
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('x', width - margin.right)
            .attr('y', -10)
            .text('GDP per capita ($)');
        // y-axis
        svg.append("g")
            .attr("transform", `translate(${margin.left},0)`)
            .attr("class", "y-axis")
            .call(d3.axisLeft(y))
            .append("text")
            .attr('text-anchor', 'end')
            .attr('fill', 'black')
            .attr('font-size', '12px')
            .attr('font-weight', 'bold')
            .attr('x', 150)
            .attr('y', 10)
            .text('Health Expenditure per capita ($)');

        // update axes on scrubber change
        yearFilter.node().addEventListener('input', () => {
            svg.select('.x-axis')
                .transition()
                .duration(1000)
                .call(d3.axisBottom(x));
            svg.select('.y-axis')
                .transition()
                .duration(1000)
                .call(d3.axisLeft(y));
        });


        const yearLabel = svg.append('text')
            .attr('class', 'year')
            .attr('x', margin.left + 5)
            .attr('y', height - margin.bottom - 20)
            .attr('fill', '#ccc')
            .attr('font-family', 'Helvetica Neue, Arial')
            .attr('font-weight', 500)
            .attr('font-size', 80)
            .text(yearToDisplay);

        // update year label on scrubber change
        yearFilter.node().addEventListener('input', () => {
            yearLabel.text(yearToDisplay);
            console.log(yearToDisplay);
            newData = data.filter(d => {
                return d.year == yearToDisplay
            });
        });

        // add circles for each country
        const countries = svg.append("g")
            .selectAll("circle")
            .data(data.filter(d => d.year == yearToDisplay))
            .join("circle")
            .attr('class', 'country')
            .attr('id', d => d.code)
            .attr('opacity', 0.7)
            .attr("cx", d => x(d.gdp))
            .attr("cy", d => y(d.exp))
            .attr("r", d => size(d.death_rate))
            .attr("fill", d => colorContinents[d.continent])
            .attr("stroke", d => d3.color(colorContinents[d.continent]).darker())

        // update circles on scrubber change
        yearFilter.node().addEventListener('input', () => {
            // transition circles but each circle should map to the same country
            svg.selectAll('.country')
                .data(data.filter(d => {
                    return d.year == yearToDisplay
                }
                ), d => d.code)
                .sort((a, b) => b.death_rate - a.death_rate)
                .transition()
                .duration(1000)
                .attr('id', d => d.code)
                .attr("cx", d => x(d.gdp))
                .attr("cy", d => y(d.exp))
                .attr("r", d => size(d.death_rate))
                .attr("fill", d => colorContinents[d.continent])
                .attr("stroke", d => d3.color(colorContinents[d.continent]).darker())
        });

        country_click = false
        country_clicked_code = ''
        countries
            .on('mouseover', function () {
                if (country_click) {
                    return;
                }

                d3.select(this).attr('stroke', '#333')
                d3.select(this).attr('opacity', 1)
                // get country data
                const d = data.filter(d => d.year == yearToDisplay).filter(d => d.code == this.id)[0];

                // add data to tooltip
                two_lines = false
                tooltip.append('text')
                    .attr('class', 'country-name')
                    .attr('x', 10)
                    .attr('y', 20)
                    .attr('font-size', '18px')
                    .attr('font-weight', 'bold')
                    .text(() => {
                        // if too long, shorten
                        if (d.country.length > 15) {
                            two_lines = true
                            return d.country.substring(0, 14) + '-';
                        }

                        return d.country;
                    });

                if (two_lines) {
                    tooltip.append('text')
                        .attr('class', 'country-name')
                        .attr('x', 10)
                        .attr('y', 35)
                        .attr('font-size', '18px')
                        .attr('font-weight', 'bold')
                        .text(d.country.substring(14));
                }

                // add data to tooltip: heading in one line and data in another
                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 60)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("GDP per capita:");

                // get data to two decimal places
                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 75)
                    .attr('font-size', '14px')
                    .text(`$${d.gdp.toFixed(2)}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 100)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Health expenditure:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 115)
                    .attr('font-size', '14px')
                    .text(`$${d.exp.toFixed(2)}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 140)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Death Rate:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 155)
                    .attr('font-size', '14px')
                    .text(`${d.death_rate}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 180)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Continent:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 195)
                    .attr('font-size', '14px')
                    .text(`${d.continent}`);



            })
            .on('mouseout', function () {

                if (country_click) {
                    return;
                }

                if (clickLegend) {

                    // reset stroke
                    d3.select(this).attr('stroke', d => d3.color(colorContinents[d.continent]).darker())

                    // remove tooltip text
                    tooltip.selectAll('text').remove();

                    if (codesToHighlight.includes(this.id)) {
                        d3.select(this).attr('opacity', 0.7)
                        return;
                    }

                    d3.select(this).attr('opacity', 0.1)
                    return;
                }

                d3.select(this).attr('opacity', 0.7)
                // reset stroke
                d3.select(this).attr('stroke', d => d3.color(colorContinents[d.continent]).darker())

                // remove tooltip text
                tooltip.selectAll('text').remove();
            })
            .on('click', function () {
                if (clickLegend) {
                    clickLegend = false
                }

                // if already clicked, reset
                if (country_click) {
                    country_click = false
                    country_clicked_code = ''
                    d3.select(this).attr('stroke', d => d3.color(colorContinents[d.continent]).darker())
                    countries.transition().duration(500).attr('opacity', 0.7)

                    tooltip.selectAll('text').remove();

                    return;
                }

                country_click = true
                country_clicked_code = this.id
                d3.select(this).attr('stroke', '#333')

                // set opacity of all other countries to 0.1
                countries.transition().duration(500).attr('opacity', 0.1)
                d3.select(this).transition().duration(500).attr('opacity', 1)


                // get country data
                const d = data.filter(d => d.year == yearToDisplay).filter(d => d.code == this.id)[0];
                console.log(d)
                // add data to tooltip
                two_lines = false
                tooltip.append('text')
                    .attr('class', 'country-name')
                    .attr('x', 10)
                    .attr('y', 20)
                    .attr('font-size', '18px')
                    .attr('font-weight', 'bold')
                    .text(() => {
                        // if too long, shorten
                        if (d.country.length > 15) {
                            two_lines = true
                            return d.country.substring(0, 14) + '-';
                        }

                        return d.country;
                    });

                if (two_lines) {
                    tooltip.append('text')
                        .attr('class', 'country-name')
                        .attr('x', 10)
                        .attr('y', 35)
                        .attr('font-size', '18px')
                        .attr('font-weight', 'bold')
                        .text(d.country.substring(14));
                }

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 60)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("GDP per capita:");

                // get data to two decimal places
                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 75)
                    .attr('font-size', '14px')
                    .text(`$${d.gdp.toFixed(2)}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 100)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Health expenditure:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 115)
                    .attr('font-size', '14px')
                    .text(`$${d.exp.toFixed(2)}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 140)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Death Rate:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 155)
                    .attr('font-size', '14px')
                    .text(`${d.death_rate}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 180)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Continent:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 195)
                    .attr('font-size', '14px')
                    .text(`${d.continent}`);
            });

        // on scrubber change, update tooltip if country is clicked
        yearFilter.node().addEventListener('input', function () {
            if (country_click) {
                const d = data.filter(d => d.year == yearToDisplay).filter(d => d.code == country_clicked_code)[0];

                // remove tooltip text
                tooltip.selectAll('text').remove();

                // add data to tooltip
                two_lines = false
                tooltip.append('text')
                    .attr('class', 'country-name')
                    .attr('x', 10)
                    .attr('y', 20)
                    .attr('font-size', '18px')
                    .attr('font-weight', 'bold')
                    .text(() => {
                        // if too long, shorten
                        if (d.country.length > 15) {
                            two_lines = true
                            return d.country.substring(0, 14) + '-';
                        }

                        return d.country;
                    });

                if (two_lines) {
                    tooltip.append('text')
                        .attr('class', 'country-name')
                        .attr('x', 10)
                        .attr('y', 35)
                        .attr('font-size', '18px')
                        .attr('font-weight', 'bold')
                        .text(d.country.substring(14));
                }

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 60)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("GDP per capita:");

                // get data to two decimal places
                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 75)
                    .attr('font-size', '14px')
                    .text(`$${d.gdp.toFixed(2)}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 100)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Health expenditure:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 115)
                    .attr('font-size', '14px')
                    .text(`$${d.exp.toFixed(2)}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 140)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Death Rate:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 155)
                    .attr('font-size', '14px')
                    .text(`${d.death_rate}`);

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 180)
                    .attr('font-size', '14px')
                    .attr('font-weight', 'bold')
                    .text("Continent:");

                tooltip.append('text')
                    .attr('class', 'country-data')
                    .attr('x', 10)
                    .attr('y', 195)
                    .attr('font-size', '14px')
                    .text(`${d.continent}`);
            }
        });

        // create a tooltip for countires being hovered over below the legend
        const tooltip = svg.append('g')
            .attr('class', 'tooltip')
            .attr('transform', `translate(${width - margin.right + 20}, ${margin.top + 150})`)

        tooltip.append('rect')
            .attr('width', 150)
            .attr('height', 210)
            .attr('fill', '#fff')
            .attr('stroke', '#333')

        countriesToHighlight = []
        codesToHighlight = []

        legendData = []
        continents.forEach((continent) => {
            legendData.push({
                continent: continent,
                color: color(continent)
            });
        });

        // create interactive legend
        const legend = svg.append('g')
            .attr('transform', `translate(${width - margin.right + 20}, ${margin.top + 20})`)
            .selectAll('.legend')
            .data(legendData)
            .join('g')
            .attr('class', 'legend')
            .attr('id', d => d.continent)
            .attr('cursor', 'pointer')

        legend.append('rect')
            .attr('x', 0)
            .attr('y', (d, i) => i * 20)
            .attr('width', 15)
            .attr('height', 15)
            .attr('fill', d => d.color)
            .attr('opacity', 0.7)

        legend.append('text')
            .attr('x', 20)
            .attr('y', (d, i) => i * 20 + 12)
            .attr('font-size', 12)
            .text(d => d.continent)

        clickLegend = false;

        legend.on('click', function () {
            console.log(this);
            // make pointer cursor
            if (clickLegend == false) {
                // highlight countries of selected continent with transition
                countriesToHighlight = data.filter(d => d.continent == this.id);
                // get codes of countries to highlight
                codesToHighlight = countriesToHighlight.map(d => d.code);

                // highlight countries
                svg.selectAll('.country')
                    .transition()
                    .duration(500)
                    .attr('opacity', d => {
                        if (codesToHighlight.includes(d.code)) {
                            return 0.8;
                        } else {
                            return 0.1;
                        }
                    }
                    )

                clickLegend = true;
            }
            else {
                svg.selectAll('.country')
                    .transition()
                    .duration(500)
                    .attr('opacity', 0.7)

                clickLegend = false;
            }
        })

        return svg.node();
    }

    // add to DOM
    chart = document.getElementById('chart');
    chart.appendChild(graph());

})

function Scrubber(values, options = {}) {
    const {
        format = value => value,
        initial = 0,
        delay = null,
        autoplay = true,
        loop = true,
        loopDelay = null,
        alternate = false
    } = options;

    values = Array.from(values);

    const form = d3.create("form").style("font", "12px var(--sans-serif)")
        .style("font-variant-numeric", "tabular-nums")
        .style("display", "flex")
        .style("height", "33px")
        .style("align-items", "center");

    const button = form.append("button").attr("name", "b").attr("type", "button")
        .style("margin-right", "0.4em").style("width", "5em");

    const label = form.append("label").style("display", "flex").style("align-items", "center");

    const input = label.append("input").attr("name", "i").attr("type", "range")
        .attr("min", 0).attr("max", values.length - 1).attr("value", initial).attr("step", 1)
        .style("width", "180px");

    const output = label.append("output").attr("name", "o").style("margin-left", "0.4em");

    // Set the initial input and output values.
    input.property("value", initial);
    output.property("value", format(values[initial]));

    let frame = null;
    let timer = null;
    let interval = null;
    let direction = 1;

    function start() {
        button.text("Pause");
        if (delay === null) frame = requestAnimationFrame(tick);
        else interval = setInterval(tick, delay);
    }

    function stop() {
        button.text("Play");
        if (frame !== null) cancelAnimationFrame(frame), frame = null;
        if (timer !== null) clearTimeout(timer), timer = null;
        if (interval !== null) clearInterval(interval), interval = null;
    }

    function running() {
        return frame !== null || timer !== null || interval !== null;
    }

    function tick() {
        if (input.property("valueAsNumber") === (direction > 0 ? values.length - 1 : direction < 0 ? 0 : NaN)) {
            if (!loop) return stop();
            if (alternate) direction = -direction;
            if (loopDelay !== null) {
                if (frame !== null) cancelAnimationFrame(frame), frame = null;
                if (interval !== null) clearInterval(interval), interval = null;
                timer = setTimeout(() => (step(), start()), loopDelay);
                return;
            }
        }
        if (delay === null) frame = requestAnimationFrame(tick);
        step();
    }

    function step() {
        input.property("valueAsNumber", (input.property("valueAsNumber") + direction + values.length) % values.length);
        input.dispatch("input", { bubbles: true });
    }

    input.on("input", event => {
        if (event && event.isTrusted && running()) stop();
        form.value = values[input.property("valueAsNumber")];
        output.property("value", format(form.value, input.property("valueAsNumber"), values));
    });

    button.on("click", () => {
        if (running()) return stop();
        direction = alternate && input.property("valueAsNumber") === values.length - 1 ? -1 : 1;
        input.property("valueAsNumber", (input.property("valueAsNumber") + direction) % values.length);
        input.dispatch("input", { bubbles: true });
        start();
    });


    if (autoplay) start();
    else stop();

    // if form is removed from DOM, stop running
    form.on("remove", stop);

    return form
}
