var m = {top: 50, right: 50, bottom: 50, left: 50}
	, h = 500 - m.top - m.bottom
	, w = 960 - m.left - m.right
	, numBins = 100;

//Using a fixed data set for demo, rather than random generated values
////TODO - update fixed data set later with a larger dataset for demo/testing (and
//// feed in via d3.csv() or d3.json() )


var x_min = d3.min(dataset, d => d.similarity)
//var xScale = d3.scale.log().domain([1e-2, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
var xScale = d3.scale.linear().domain([0, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
//var xScale = d3.scale.linear().domain([0, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
var yScaleDensity = d3.scale.linear().domain([0, 3]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
//var yScaleDensity = d3.scale.log().domain([CUTOFF,50]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))



var xAxis = d3.svg.axis()
    .scale(xScale)
    .orient('bottom');


var yAxis2 = d3.svg.axis()
    .scale(yScaleDensity)
    .orient('right');

//Draw svg
var svg = d3.select("body").append("svg")
    .attr("width", w + m.left + m.right)
    .attr("height", h + m.top + m.bottom)
    .append("g")
    .attr("transform", "translate(" + m.left + "," + m.top + ")");



// Function to compute density
function kernelDensityEstimator(kernel, X) {
    return function(V) {
        return X.map(function(x) {
            return [x, d3.mean(V, function(v) {
                return kernel(x - v);
            })];
        });
    };
}

function kernelEpanechnikov(k) {
    return function(v) {
        return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
    };
}
// Compute kernel density estimation
var kde = kernelDensityEstimator(kernelEpanechnikov(0.01), xScale.ticks(100));
var density = kde(dataset.map(function(d) {
    return d.similarity;
}))
density[0].unshift(0);
density[1].unshift(0);



	density[0].unshift(0);
density[1].unshift(0);

console.log(density);




var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient('bottom');


var yAxis2 = d3.svg.axis()
	.scale(yScaleDensity)
	.orient('right');

console.log(yScaleDensity);

svg.append("path")
	.attr("class", "mypath")
	.datum(density)
	.attr("fill", "#69b3a2")
	.attr("opacity", ".8")
	.attr("stroke", "#000")
	.attr("stroke-width", 1)
	.attr("stroke-linejoin", "round")
	.attr("d",  d3v4.line()
		.curve(d3v4.curveBasis)
		.x(function(d) { return xScale(d[0]); })
		//.y(function(d) { return yScaleDensity(d[1]); })
		.y(function(d) {
			if(d[1] <= CUTOFF){
				return(yScaleDensity(CUTOFF))
			}{
				return yScaleDensity(d[1]);
			}
		})
	);
svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + h + ")")
	.call(xAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 4)
	.attr("dy", "-.71em")
	.style("text-anchor", "middle")
	.text("Spectral angle");

svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + [w, 0] + ")")
	.call(yAxis2)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 4)
	.attr("dy", "-.71em")
	.style("text-anchor", "end")
// .text("cdf");
	.text("Density");
});         var xAxis = d3.svg.axis()
	.scale(xScale)
	.orient('bottom');


var yAxis2 = d3.svg.axis()
	.scale(yScaleDensity)
	.orient('right');

console.log(yScaleDensity);

svg.append("path")
	.attr("class", "mypath")
	.datum(density)
	.attr("fill", "#69b3a2")
	.attr("opacity", ".8")
	.attr("stroke", "#000")
	.attr("stroke-width", 1)
	.attr("stroke-linejoin", "round")
	.attr("d",  d3v4.line()
		.curve(d3v4.curveBasis)
		.x(function(d) { return xScale(d[0]); })
		//.y(function(d) { return yScaleDensity(d[1]); })
		.y(function(d) {
			if(d[1] <= CUTOFF){
				return(yScaleDensity(CUTOFF))
			}{
				return yScaleDensity(d[1]);
			}
		})
	);
svg.append("g")
	.attr("class", "x axis")
	.attr("transform", "translate(0," + h + ")")
	.call(xAxis)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 4)
	.attr("dy", "-.71em")
	.style("text-anchor", "middle")
	.text("Spectral angle");

svg.append("g")
	.attr("class", "y axis")
	.attr("transform", "translate(" + [w, 0] + ")")
	.call(yAxis2)
	.append("text")
	.attr("transform", "rotate(-90)")
	.attr("y", 4)
	.attr("dy", "-.71em")
	.style("text-anchor", "end")
