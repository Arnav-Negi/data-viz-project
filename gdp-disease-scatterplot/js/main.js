let ready = false;

const startYear = 2000;
const endYear = 2019;

let dataArray = [];
let healthExpenditure = [];
d3.csv("https://raw.githubusercontent.com/Arnav-Negi/data-viz-project/main/data/health_expenditure.csv", function (data) {
    let toPush = {
        "country": data["Country Name"]
    }
    for (let i = startYear; i <= endYear; i++) {
        if (data[i.toString()] !== "")
            toPush[i.toString()] = +data[i.toString()];
    }
    healthExpenditure.push(toPush);
}).then(function () {
    d3.csv()
});