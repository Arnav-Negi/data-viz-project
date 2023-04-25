let ready = false;

let dataArray = [];
let healthExpenditure = [];
d3.csv("https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/health_expenditure.csv", function(data) {
        healthExpenditure.push(data);
}).then(function() {
    ready = true;
    console.log(healthExpenditure);
});