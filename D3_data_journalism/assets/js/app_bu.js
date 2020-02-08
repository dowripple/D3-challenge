// setup chart dimensions and padding
var svgWidth = 960;
var svgHeight = 500;

// setup margin object
var margin = {
  top: 20,
  right: 20,
  bottom: 20,
  left: 20
};

// setup chart dimensions
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// Create an SVG wrapper, append an SVG group that will hold our chart,
// and shift the latter by left and top margins.
var svg = d3
  .select(".scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// Append an SVG group
var chartGroup = svg.append("g")
  .attr("transform", `translate(${margin.left}, ${margin.top})`);

// empty array for chart data
// var chartData = [];

// Initial Params
var chosenXAxis = "healthcare";
var chosenYAxis = "age";

// arrays of the possible axis elements
var xAxisLabels = [
    'healthcare',
    'obesity',
    'smokes'
];
var yAxisLabels = [
    'age',
    'income',
    'poverty'
]
var labelTitles = {
    'age': 'Median Age',
    'income': 'Median Income',
    'poverty': '% In Poverty %',
    'healthcare': '% With Healthcare',
    'obesity': '% Obese',
    'smokes': '% Smokers'
}

// function used for updating x-scale var upon click on axis label
function xScale(demoData, chosenXAxis) {
    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(demoData, d => d[chosenXAxis]) * 0.8,
            d3.max(demoData, d => d[chosenXAxis]) * 1.2
        ])
        .range([0, chartWidth]);
  
    return xLinearScale;
}
// y scale now
function yScale(demoData, chosenYAxis) {
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(demoData, d => d[chosenXAxis]) * 0.8,
            d3.max(demoData, d => d[chosenXAxis]) * 1.2
        ])
        .range([chartHeight, 0]);
    
    return yLinearScale;
}

// function used for updating xAxis var upon click on axis label
function renderXAxis(newXScale, xAxis) {
    var bottomAxis = d3.axisBottom(newXScale);
  
    xAxis.transition()
      .duration(1000)
      .call(bottomAxis);
  
    return xAxis;
}
// y axis verion
function renderYAxis(newYScale, yAxis) {
    var leftAxis = d3.axisLeft(newYScale)

    yAxis.transition()
        .duration(1000)
        .call(leftAxis);
    
    return yAxis;

}

// function used for updating circles group with a transition to
// new circles
function renderCircles(circlesGroup, newScale, chosenAxis, xy) {

    if (xy === 'x') {
        circlesGroup.transition()
        .duration(1000)
        .attr(`cx`, d => newScale(d[chosenAxis]));
    } else {
        circlesGroup.transition()
        .duration(1000)
        .attr(`cy`, d => newScale(d[chosenAxis]));
    }
    return circlesGroup;
}

// function used for updating circles group with new tooltip
function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

    if (chosenXAxis === 'healthcare') {
        var xLabel = 'Lack Healthcare %:';
    } else if (chosenAxis === 'obesity') {
        var xLabel = 'Obesity %:';
    } else {
        var xLabel = '% Smoke:'
    }
  
    if (chosenYAxis === 'age') {
        var yLabel = 'Median Age:'
    } else if (chosenYAxis === 'income') {
        var yLabel = 'Median Income:'
    } else {
        var yLabel = 'Poverty %:'
    }

    var toolTip = d3.tip()
        .attr("class", "tooltip")
        .offset([80, -60])
        .html(function(d) {
            return (`${d.state}<br>${xlabel}: ${d[chosenXAxis]}<br>${xLabel}: ${d[chosenYAxis]}`);
        });
  
    circlesGroup.call(toolTip);
  
    circlesGroup.on("mouseover", function(data) {
      toolTip.show(data);
    })
      // onmouseout event
      .on("mouseout", function(data, index) {
        toolTip.hide(data);
      });
  
    return circlesGroup;
}

// Retrieve data from the CSV file and execute everything below
d3.csv("assets/data/data.csv").then(function(demoData) {

  // console.log(demoData)

  // parse data, converting strings to numbers
  demoData.forEach(function(d) {

    d.poverty = +d.poverty;
    d.age = +d.age;
    d.income = +d.income;
    d.healthcare = +d.healthcare;
    d.healthcareLow = +d.healthcareLow;
    d.healthcareHigh = +d.healthcareHigh;
    d.obesity = +d.obesity;
    d.obesityLow = +d.obesityLow;
    d.obesityHigh = +d.obesityHigh;
    d.smokes = +d.smokes;
    d.smokesLow = +d.smokesLow;
    d.smokesHigh = +d.smokesHigh;

  })

  // console.log(demoData)

  // xLinearScale function above csv import
  var xLinearScale = xScale(demoData, chosenXAxis);

  // Create y scale function
  var yLinearScale = d3.scaleLinear()
    .domain([0, d3.max(demoData, d => d.income)])
    .range([chartHeight, 0]);

  // Create initial axis functions
  var bottomAxis = d3.axisBottom(xLinearScale);
  var leftAxis = d3.axisLeft(yLinearScale);

  // append x axis
  var xAxis = chartGroup.append("g")
    .classed("x-axis", true)
    .attr("transform", `translate(0, ${chartHeight})`)
    .call(bottomAxis);

  // append y axis
  chartGroup.append("g")
    .call(leftAxis);

  // append initial circles
  var circlesGroup = chartGroup.selectAll("circle")
    .data(demoData)
    .enter()
    .append("circle")
    .attr("cx", d => xLinearScale(d[chosenXAxis]))
    .attr("cy", d => yLinearScale(d[chosenYAxis]))
    .attr("r", 20)
    .attr("fill", "red")
    .attr("opacity", ".5");

  // Create group for  2 x- axis labels
  var labelsGroup = chartGroup.append("g")
    .attr("transform", `translate(${chartWidth / 2}, ${chartHeight + 20})`);

  var smokesLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 20)
    .attr("value", "smokes") // value to grab for event listener
    .classed("active", true)
    .text("Smokers");

  var incomeLabel = labelsGroup.append("text")
    .attr("x", 0)
    .attr("y", 40)
    .attr("value", "income") // value to grab for event listener
    .classed("inactive", true)
    .text("Income");

  // append y axis
  chartGroup.append("text")
    .attr("transform", "rotate(-90)")
    .attr("y", 0 - margin.left)
    .attr("x", 0 - (chartHeight / 2))
    .attr("dy", "1em")
    .classed("axis-text", true)
    .text("Income");

  // updateToolTip function above csv import
  console.log(circlesGroup)
  var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

  // // x axis labels event listener
  // labelsGroup.selectAll("text")
  //   .on("click", function() {
  //     // get value of selection
  //     var value = d3.select(this).attr("value");
  //     if (value !== chosenXAxis) {

  //       // replaces chosenXAxis with value
  //       chosenXAxis = value;

  //       // console.log(chosenXAxis)

  //       // functions here found above csv import
  //       // updates x scale for new data
  //       xLinearScale = xScale(hairData, chosenXAxis);

  //       // updates x axis with transition
  //       xAxis = renderAxes(xLinearScale, xAxis);

  //       // updates circles with new x values
  //       circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

  //       // updates tooltips with new info
  //       circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

  //       // changes classes to change bold text
  //       if (chosenXAxis === "num_albums") {
  //         albumsLabel
  //           .classed("active", true)
  //           .classed("inactive", false);
  //         hairLengthLabel
  //           .classed("active", false)
  //           .classed("inactive", true);
  //       }
  //       else {
  //         albumsLabel
  //           .classed("active", false)
  //           .classed("inactive", true);
  //         hairLengthLabel
  //           .classed("active", true)
  //           .classed("inactive", false);
  //       }
  //     }

});