let ready = false;

const countries = [
    "China",
    "India",
    "United States",
    "Indonesia",
    "Pakistan",
    "Brazil",
    "Nigeria",
    "Bangladesh",
    "Russia",
    "Mexico",
    "Japan",
    "Ethiopia",
    "Philippines",
    "Egypt",
    "Vietnam",
    "DR Congo",
    "Iran",
    "Turkey",
    "Germany",
    "Thailand",
    "United Kingdom",
    "France",
    "Italy",
    "Tanzania",
    "South Africa",
    "Myanmar",
    "South Korea",
    "Colombia",
    "Kenya",
    "Spain",
    "Uganda",
    "Argentina",
    "Algeria",
    "Sudan",
    "Ukraine",
    "Iraq",
    "Afghanistan",
    "Poland",
    "Canada",
    "Morocco",
    "Saudi Arabia",
    "Uzbekistan",
    "Peru",
    "Malaysia",
    "Angola",
    "Mozambique",
    "Ghana",
    "Yemen",
    "Nepal",
    "Venezuela",
    "Madagascar",
    "Cameroon",
    "Australia",
    "Niger",
    "Sri Lanka",
    "Burkina Faso",
    "Mali",
    "Romania",
    "Malawi",
    "Syria",
    "Kazakhstan",
    "Zambia",
    "Netherlands",
    "Chile",
    "Guatemala",
    "Ecuador",
    "Senegal",
    "Cambodia",
    "Chad",
    "Somalia",
    "Zimbabwe",
    "Benin",
    "Rwanda",
    "Tunisia",
    "Belgium",
    "Burundi",
    "Bolivia",
    "Haiti",
    "Cuba",
    "South Sudan",
    "Dominican Republic",
    "Czech Republic",
    "Greece",
    "Jordan",
    "Portugal",
    "Azerbaijan",
    "Sweden",
    "United Arab Emirates",
    "Honduras",
    "Hungary",
    "Tajikistan",
    "Belarus",
    "Austria",
    "Papua New Guinea",
    "Serbia",
    "Israel",
    "Switzerland",
    "Sierra Leone",
    "Hong Kong",
    "Laos",
    "Paraguay",
    "Bulgaria",
    "Libya",
    "Lebanon",
    "El Salvador",
    "Nicaragua",
    "Kyrgyzstan",
    "Turkmenistan",
    "Singapore",
    "Denmark",
    "Finland",
    "Slovakia",
    "Congo",
    "Norway",
    "Oman",
    "Costa Rica",
    "Liberia",
    "Ireland",
    "Central African Republic",
    "New Zealand",
    "Mauritania",
    "Panama",
    "Kuwait",
    "Croatia",
    "Moldova",
    "Georgia",
    "Eritrea",
    "Uruguay",
    "Bosnia and Herzegovina",
    "Mongolia",
    "Armenia",
    "Jamaica",
    "Qatar",
    "Albania",
    "Puerto Rico",
    "Lithuania",
    "Namibia"
];

const errorMap = {
    'Egypt, Arab Rep.': 'Egypt',
    'Bahamas, The': 'Bahamas',
    'Brunei Darussalam': 'Brunei',
    'Congo, Dem. Rep.': 'DR Congo',
    'Congo, Rep.': 'Congo',
    'Iran, Islamic Rep.': 'Iran',
    'Kyrgyz Republic': 'Kyrgyzstan',
    'Lao PDR': 'Laos',
    'Russian Federation': 'Russia',
    'Slovak Republic': 'Slovakia',
    'Korea, Rep.': 'South Korea',
    'Syrian Arab Republic': 'Syria',
    'Turkiye': 'Turkey',
    'Venezuela, RB': 'Venezuela',
    'Yemen, Rep.': 'Yemen',
}

const startYear = 2000;
const endYear = 2019;

let dataMap = {};
let healthExpenditure = {};

let maxHealthExpenditure = 0;
let maxDaly = 0;

// Set up chart
const margin = {top: 20, right: 20, bottom: 30, left: 40};
const width = 1000 - margin.left - margin.right;
const height = 800 - margin.top - margin.bottom;

const div = d3.select('#main');
const svg = div.append('svg')
    .attr('width', width + margin.left + margin.right)
    .attr('height', height + margin.top + margin.bottom)
    .append('g')
    .attr('transform', 'translate(' + margin.left + ',' + margin.top + ')');


function buildScatterPlot(year) {
    const xScale = d3.scaleLog()
        .domain([1, maxHealthExpenditure + 200])
        .range([0, width])
        .nice();


    const yScale = d3.scaleLinear()
        .domain([0, maxDaly + 100])
        .rangeRound([height, 0])
        .nice();

    const xAxis = d3.axisBottom(xScale)
        .tickValues([1, 10, 100, 500, 1000, 5000, 10000]);

    const yAxis = d3.axisLeft(yScale);

    svg.append('g')
        .attr('class', 'x axis')
        .attr('transform', 'translate(0,' + height + ')')
        .call(xAxis);

    svg.append('g')
        .attr('class', 'y axis')
        .call(yAxis);

    const xLabel = svg.append('text')
        .attr('class', 'x label')
        .attr('text-anchor', 'end')
        .attr('x', width)
        .attr('y', height - 6)
        .text('Health Expenditure per capita (USD)');

    const yLabel = svg.append('text')
        .attr('class', 'y label')
        .attr('text-anchor', 'end')
        .attr('y', 6)
        .attr('dy', '.75em')
        .attr('transform', 'rotate(-90)')
        .text('DALY');

    const points = svg.selectAll('.point')
        .data(dataMap[year.toString()])
        .enter()
        .append('circle')
        .attr('class', 'point')
        .attr('r', 5)
        .attr('cx', function (d) {
            console.log(d)
            return xScale(healthExpenditure[d["Country"]][year.toString()]);
        })
        .attr('cy', function (d) {
            return yScale(d["DALY"]);
        })
        .style('stroke', 'steelblue')
        .style('fill', 'none');


}


d3.csv("https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/health_expenditure.csv", function (data) {
    let toPush = {}

    for (let i = startYear; i <= endYear; i++) {
        if (+data[i.toString()] > 10) {
            toPush[i.toString()] = +data[i.toString()];
            maxHealthExpenditure = Math.max(maxHealthExpenditure, +data[i.toString()]);
        }
    }
    const name = errorMap[data["Country Name"]] ? errorMap[data["Country Name"]] : data["Country Name"];
    healthExpenditure[name] = toPush;
}).then(function () {
    console.log(healthExpenditure)
    d3.csv("https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/burden-of-disease-rates-from-ncds.csv", function (data) {
        if (!dataMap[data["Year"]]) {
            dataMap[data["Year"]] = [];
        }

        if (data.Entity.includes('World')) return;
        if (data.Entity.includes('WB')) return;
        if (data.Entity.includes('Bank')) return;
        if (data.Entity.includes('WHO')) return;
        if (data.Entity.includes('G20')) return;
        if (data.Entity.includes('OECD')) return;
        if (!countries.includes(data.Entity)) return;

        dataMap[data["Year"]].push({
            "Country": data["Entity"],
            "DALY": +data["DALY"],
        });
        maxDaly = Math.max(maxDaly, data["DALY"]);
    }).then(function () {
        ready = true;
        buildScatterPlot(endYear);
    });
});