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
        d.total_deaths = +d.total_deaths;
    });

    years = d3.extent(data, d => d.year);
    console.log("years:", years);

    data = data.filter(d => {
        if (d.gdp > 0 && d.exp > 0) {
            return d;
        }
    });

    height = 600;
    width = 800;
    margin = ({ top: 20, right: 20, bottom: 20, left: 50 });

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

    death_extent = d3.extent(data.filter(d => d.year == yearToDisplay), d => d.total_deaths)
    console.log("death_extent:", death_extent);

    size = d3.scaleSqrt()
        .domain(death_extent)
        .range([4, 35]);

    // append to dom
    const yearScrubber = document.getElementById('scrubber');
    yearScrubber.appendChild(yearFilter.node());

    // yearFilter is a form element. extract the value from it
    yearFilter.node().addEventListener('input', () => {
        // get the value from the form element
        yearToDisplay = output.value;
        console.log(typeof yearToDisplay);
        console.log(output.value == 1991);

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
            .domain(d3.extent(data.filter(d => d.year == yearToDisplay), d => d.total_deaths))
            .range([4, 35]);
        
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
            .attr('x', 90)
            .attr('y', 10)
            .text('Health Expenditure (%)');

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
                console.log(d.year)
                return d.year == yearToDisplay
            });
        });

        // add circles for each country
        const countries = svg.append("g")
            .selectAll("circle")
            .data(data.filter(d => d.year == yearToDisplay))
            .join("circle")
            .sort((a, b) => b.total_deaths - a.total_deaths)
            .attr('class', 'country')
            .attr('opacity', 0.7)
            .attr("cx", d => x(d.gdp))
            .attr("cy", d => y(d.exp))
            .attr("r", d => size(d.total_deaths))
            .attr("fill", d => color(d.continent))

        // update circles on scrubber change
        yearFilter.node().addEventListener('input', () => {
            // transition circles
            svg.selectAll('.country')
                .data(data.filter(d => d.year == yearToDisplay))
                .transition()
                .duration(1000)
                .attr("cx", d => x(d.gdp))
                .attr("cy", d => y(d.exp))
                .attr("r", d => size(d.total_deaths))
                .attr("fill", d => color(d.continent))

        });

        // add country labels
        countries
            .append('title')
            .text(d => d.country);

        countries
            .on('mouseover', function () {
                d3.select(this).attr('stroke', '#333').attr('stroke-width', 2);
            })
            .on('mouseout', function () {
                d3.select(this).attr('stroke', null);
            });

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
