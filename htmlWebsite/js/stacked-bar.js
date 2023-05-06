var marginStacked = { top: 40, right: 30, bottom: 20, left: 30 },
  widthStacked = 860 - marginStacked.left - marginStacked.right + 300,
  heightstacked = 600 - marginStacked.top - marginStacked.bottom + 100;

var svgStacked = d3
  .select("#stack_chart")
  .append("svg")
  .attr("width", widthStacked + marginStacked.left + marginStacked.right)
  .attr("height", heightstacked + marginStacked.top + marginStacked.bottom)
  .append("g")
  .attr(
    "transform",
    "translate(" + marginStacked.left + "," + marginStacked.top + ")"
  );

d3.csv(
  "https://raw.githubusercontent.com/himanibelsare/data-vis-files/main/cause_of_deaths.csv"
).then(function (data) {
  const myArray = [];
  for (let year = 1990; year <= 2019; year++) {
    const filteredData = {
      Year: year,
      Meningitis: 0,
      Alzheimer: 0,
      Parkinsons: 0,
      Nutritional: 0,
      Malaria: 0,
      Drowning: 0,
      "Interpersonal Violence": 0,
      "Maternal Disorders": 0,
      "HIV/AIDS": 0,
      Drug: 0,
      Tuberculosis: 0,
      Cardiovascular: 0,
      "Lower Respiratory": 0,
      Neonatal: 0,
      Alcohol: 0,
      "Self-harm": 0,
      Nature: 0,
      Diarrheal: 0,
      "Heat/Cold": 0,
      Neoplasms: 0,
      Terrorism: 0,
      Diabetes: 0,
      Kidney: 0,
      Poisonings: 0,
      Malnutrition: 0,
      Road: 0,
      "Chronic Respiratory": 0,
      Liver: 0,
      Digestive: 0,
      Fire: 0,
      Hepatitis: 0,
    };

    data.forEach((current) => {
      if (current.Year === year.toString()) {
        for (const [key, value] of Object.entries(current)) {
          if (key !== "Country" && key !== "Code" && key !== "Year") {
            if (filteredData.hasOwnProperty(key)) {
              filteredData[key] += parseInt(value);
            }
          }
        }
      }
    });

    myArray.push(Object.assign({}, filteredData));
  }
  var subgroups = data.columns.slice(3);

  var groupsStacked = [
    1990, 1991, 1992, 1993, 1994, 1995, 1996, 1997, 1998, 1999, 2000, 2001,
    2002, 2003, 2004, 2005, 2006, 2007, 2008, 2009, 2010, 2011, 2012, 2013,
    2014, 2015, 2016, 2017, 2018, 2019,
  ];

  console.log(groupsStacked);
  var x = d3.scaleBand().domain(groupsStacked).range([0, 800]).padding([0.4]);
  var xGroup = svgStacked
    .append("g")
    .attr("transform", "translate(0," + heightstacked + ")")
    .call(d3.axisBottom(x).tickSizeOuter(0));
  var y = d3.scaleLinear().domain([0, 100]).range([heightstacked, 0]);
  svgStacked.append("g").call(d3.axisLeft(y));
  var color = d3
    .scaleOrdinal()
    .domain(subgroups)
    .range([
      "#FFB6C1",
      "#FF69B4",
      "#FFC0CB",
      "#F08080",
      "#CD5C5C",
      "#FFA07A",
      "#FF8C00",
      "#FFD700",
      "#FFFF00",
      "#ADFF2F",
      "#00FF7F",
      "#00ffff",
      "#40E0D0",
      "#00BFFF",
      "#1E90FF",
      "#4169E1",
      "#6A5ACD",
      "#9932CC",
      "#FF1493",
      "#DC143C",
      "#A52A2A",
      "#556B2F",
      "#008080",
      "#228B22",
      "#2F4F4F",
      "#808080",
      "#D3D3D3",
      "#F5DEB3",
      "#000000",
      "#FF4500",
    ]);

  myArray.forEach(function (d) {
    tot = 0;
    for (i in subgroups) {
      let name = subgroups[i];
      tot += +d[name];
    }
    for (i in subgroups) {
      let name = subgroups[i];
      d[name] = (d[name] / tot) * 100;
    }
  });

  const myCountries = new Set();
  data.forEach((item) => {
    myCountries.add(item.Country);
  });
  var countries = Array.from(myCountries);

  var stackedData = d3.stack().keys(subgroups)(myArray);

  svgStacked
    .append("g")
    .selectAll("g")
    .data(stackedData)
    .enter()
    .append("g")
    .attr("fill", function (d) {
      return color(d.key);
    })
    .selectAll("rect")
    .data(function (d, i) {
      return d;
    })
    .enter()
    .append("rect")
    .attr("x", function (d) {
      // console.log(d.data.Year);
      return x(d.data.Year);
    })
    .attr("y", function (d) {
      return y(d[1]);
    })
    .attr("height", function (d) {
      return y(d[0]) - y(d[1]);
    })
    .attr("width", x.bandwidth())
    .on("mouseover", function (d, i) {
      d3.select(this).attr("stroke", "black").attr("stroke-width", "2px");
      let difference = i[1] - i[0];
      //   console.log(difference);
      let key = "";
      for (const k in i.data) {
        if (Math.abs(i.data[k] - difference) < Math.pow(10, -5)) {
          key = k;
        }
      }
      // console.log(key);
      // console.log(i.data[key]);
      // console.log(i.data.Year);

      var percent = i.data[key];

      let tooltipContent1 =
        "Disease: " +
        key.toString() +
        "<br>" +
        "Number %: " +
        percent +
        "<br>" +
        "Year: " +
        i.data.Year.toString();

      tippy(this, {
        content: tooltipContent1,
        allowHTML: true,
      });
    })
    .on("mouseout", function (d, i) {
      d3.select(this).attr("stroke", "none");
    });

  svgStacked.selectAll("rect").on("click", function (d, i) {
    // groups = countries
    // sub groups = diseases (same)
    const newYear = i.data.Year;
    // console.log(newYear);
    svgStacked.selectAll("rect").remove();
    xGroup.remove();

    var x = d3
      .scaleBand()
      .domain(countries)
      .range([0, widthStacked])
      .padding([0.35]);

    svgStacked
      .append("g")
      .attr("transform", "translate(0," + heightstacked + ")")
      .call(d3.axisBottom(x).tickSizeOuter(0))
      .selectAll("text")
      .remove();

    var myNewData = new Set();
    data.forEach((item) => {
      console.log(item.Year);
      if (item.Year === newYear.toString()) myNewData.add(item);
    });
    var newData = Array.from(myNewData);
    // console.log(newData);
    newData.forEach(function (d) {
      tot = 0;
      for (i in subgroups) {
        // console.log(subgroups[i], d[subgroups[i]]);
        let name = subgroups[i];
        tot += +d[name];
      }
      for (i in subgroups) {
        let name = subgroups[i];
        d[name] = (d[name] / tot) * 100;
      }
    });

    var stackedData = d3.stack().keys(subgroups)(newData);

    svgStacked
      .append("g")
      .selectAll("g")
      .data(stackedData)
      .enter()
      .append("g")
      .attr("fill", function (d) {
        return color(d.key);
      })
      .selectAll("rect")
      .data(function (d) {
        return d;
      })
      .enter()
      .append("rect")
      .attr("x", function (d) {
        // console.log(d.data.Country);
        return x(d.data.Country);
      })
      .attr("y", function (d) {
        return y(d[1]);
      })
      .attr("height", function (d) {
        return y(d[0]) - y(d[1]);
      })
      .attr("width", x.bandwidth())
      .on("mouseover", function (e, i) {
        d3.select(this).attr("stroke", "black").attr("stroke-width", "2px");
        console.log(e, i);
        // console.log(d[1] - d[0]);
        let difference = i[1] - i[0];
        // console.log(difference);
        // console.log(typeof (d.data));
        let key = "";
        for (const k in i.data) {
          if (Math.abs(i.data[k] - difference) < Math.pow(10, -5)) {
            key = k;
          }
        }
        // console.log(i.data.Country);
        // console.log(key);
        // console.log(i.data[key]);
        // console.log(i.data.Year);

        percent = i.data[key];
        let tooltipContent1 =
          "Country: " +
          i.data.Country +
          "<br>" +
          "Disease: " +
          key +
          "<br>" +
          "Number %: " +
          percent +
          "<br>" +
          "Year: " +
          i.data.Year;

        tippy(this, {
          content: tooltipContent1,
          allowHTML: true,
        });
      })
      .on("mouseout", function (d, i) {
        d3.select(this).attr("stroke", "none");
      });
  });
});
