// Bar chart race for terrorism. Linear easing between keyframes.

let data = [];
d3.csv("https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/disease-burden-from-injuries.csv", function (d) {
    d.Year = parseInt(d.Year);
    data.push(d);
}).then(function () {
    console.log(data)

    const duration = 1000; // duration between keyframes
    d3.group(data, d => d.Country)
});