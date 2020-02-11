// define svg area
var svgWidth = 960;
var svgHeight = 500;

// margin object
var margin = {
  top: 60,
  right: 60,
  bottom: 120,
  left: 150
};

// setup chart dimensions
var chartWidth = svgWidth - margin.left - margin.right;
var chartHeight = svgHeight - margin.top - margin.bottom;

// create SVG wrapper, append to scatter div
var svg = d3.select("scatter")
  .append("svg")
  .attr("width", svgWidth)
  .attr("height", svgHeight);

// append am svg group
var chartGroup = svg.append('g')
    .attr('transform', `translate(${margin.left}, ${margin.top})`);

// initial params
var chosenXAxis = 'income';

// function for updating x-scale var
function xScale(stateData, chosenXAxis) {

    // create scales
    var xLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d => d[chosenXAxis]) * 0.08,
            d3.max(stateData, d=> d[chosenXAxis]) * 1.2
        ])
        .range([0, chartWidth]);
    
    return xLinearScale;

}

// function to update axis on click of label
function renderAxis(newXScale, xAxis) {

    var bottomAxis = d3.axisBottom(newXScale);

    xAxis.transition()
        .duration(1000)
        .call(bottomAxis);

    return xAxis;

}

// function for updating circles group with transition to new circles
function renderCircles(circlesGroup, newXScale, chosenXAxis) {

    circlesGroup.transition()
        .duration(1000)
        .attr('cx', d=> newXScale(d[chosenXAxis]));
    
    return circlesGroup;
}

// function for updating cirles group with new tooltip
function updateToolTip(chosenXAxis, circlesGroup) {

    if (chosenXAxis === 'income') {
        var label = 'Median Income:';
    } else {
        var label = 'Poverty:'
    }

    var toolTip = d3.tip()
        .attr('class', 'tooltip')
        .offset([80, -60])
        .html(function(d) {
            return(`${d.state}<br>${label} ${d[chosenXAxis]}`);
        });
    
    circlesGroup.call(toolTip);

    circlesGroup.on('mouseover', function(data) {
        toolTip.show(data);
    })
        .on('mouseout', function(data, index) {
            toolTip.hide(data);
        });
    
    return circlesGroup;
}

// retrieve data from CSV and make the chart
d3.csv('assets/data/data.csv').then(function(stateData) {

    // taking a peek at the data
    // console.log(stateData)

    // clean up the numbers (string to #)
    stateData.forEach(function(data) {

        data.poverty = +data.poverty;
        data.age = +data.age;
        data.income = +data.income;
        data.healthcare = +data.healthcare;
        data.obesity = +data.obesity;
        data.smokes = +data.smokes;

    });  

    // verify numbers are numbers
    // console.log(stateData);

    // xlinear scale function
    var xLinearScale = xScale(stateData, chosenXAxis);

    // create y-scale function
    var yLinearScale = d3.scaleLinear()
        .domain([d3.min(stateData, d=> d.age)*0.8, d3.max(stateData, d=> d.age)*1.2])
        .range([chartHeight, 0]);
    
    // create initial axis functions
    var bottomAxis = d3.axisBottom(xLinearScale);
    var leftAxis = d3.axisLeft(yLinearScale);

    // append x axis
    var xAxis = chartGroup.append('g')
        .classed('x-axis', true)
        .attr('transform', `translate(0, ${chartHeight})`)
        .call(bottomAxis);
    
    // append the y - axis
    chartGroup.append('g')
        .call(leftAxis);

    // append initial circles
    var circlesGroup = chartGroup.selectAll('circle')
        .data(stateData)
        .enter()
        .append('circle')
        .attr('cx', d=> xLinearScale(d[chosenXAxis]))
        .attr('cy', d=> yLinearScale(d.age))
        .attr('r', 20)
        .attr('fill', 'lightblue')
        .attr('opacity', '.5');
    
    // create group for 2 x axis labels
    var labelsGroup = chartGroup.append('g')
        .attr('transform', `translate(${chartWidth / 2}, ${chartHeight + 20})`);

    var incomeLabel = labelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 20)
        .attr('value', 'income')
        .classed('active', true)
        .text('Median Household Income');

    var povertyLabel = labelsGroup.append('text')
        .attr('x', 0)
        .attr('y', 40)
        .attr('value', 'poverty')
        .classed('active', true)
        .text('Poverty Rate (%)');
    
    // append y axis
    chartGroup.append('text')
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (chartHeight / 2))
        .attr("dy", "1em")
        .classed("axis-text", true)
        .text("Median Age");
    
    // update tooltip function
    var circlesGroup = updateToolTip(chosenXAxis, circlesGroup);

    // x axis labels event listener
    labelsGroup.selectAll('text')
        .on('click', function() {

            // get selection value
            var value = d3.select(this).attr('value');
            if (value !== chosenXAxis) {

                // replace chosen axis with selected value
                chosenXAxis = value;

                // update x scale for new data
                xLinearScale = xScale(stateData, chosenXAxis);

                // update x axis with transition
                xAxis = renderAxis(xLinearScale, xAxis);

                // update circles with new x values
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis);

                // updates tooltips
                ciclesGroup = updateToolTip(chosenXAxis, circlesGroup);

                // change classes to change bold text
                if (chosenAxis === 'income') {
                    incomeLabel
                        .classed('active', true)
                        .classed('inactive', false);
                    povertyLabel
                        .classed('active', false)
                        .classed('inactive', true);
                } else {
                    incomeLabel
                        .classed('active', false)
                        .classed('inactive', true);
                    povertyLabel
                        .classed('active', true)
                        .classed('inactive', false);       
                }
            }
        });

})