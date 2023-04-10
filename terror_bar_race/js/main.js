// Bar chart race for terrorism. Linear easing between keyframes.
let data = [];
d3.csv("https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/annual-number-of-deaths-by-cause.csv", function (d) {
    d.Year = parseInt(d.Year);
    d.Terrorism = parseInt(d.Terrorism)
    data.push(d);
}).then(function () {
    console.log(data)

    const duration = 1000; // duration between keyframes
    d3.group(data, d => d.Country);

    // number of bars that show
    const n = 12;

    const countryNames = new Set(data.map(d => d.Country));
    let dataMap = Array.from(d3.rollup(data,
        ([d]) => d.Terrorism, d => duration.Year,  d => d.Country))
        .sort(([a], [b]) => d3.ascending(a , b));

    console.log(dataMap);
    
});