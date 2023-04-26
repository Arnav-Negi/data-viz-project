const { hide } = require("yargs");

const getData = async () => {
    const res = await d3.csv('https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/deaths_health_gdp.csv');
    return res;
}

getData().then((data) => {
    console.log(data.columns);
    console.log(data);

    years = d3.extent(data, d => +d.year);
    console.log("years:",years);

    initial_data = data.filter(d => d.year === years[0]);

    height = 600;
    width = 800;
    margin = ({top: 20, right: 20, bottom: 20, left: 20});

    x = d3.scaleLinear()
        .domain(d3.extent(initial_data, d => d.gdp))
        .range([margin.left, width - margin.right])
        .nice();
    
    y = d3.scaleLinear()
        .domain(d3.extent(initial_data, d => d.exp))
        .range([height - margin.bottom, margin.top])
        .nice();

    color = d3.scaleOrdinal()
        .domain(initial_data.map(d => d.continent))

})