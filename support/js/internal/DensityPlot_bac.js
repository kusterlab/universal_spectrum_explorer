/**
 * @descriptionThe visualization generation of IPSA is driven by the AngularJS directive coded below. This directive will embed an SVG element into a <div>
 *    Javascript objects are listed as attributes to the div tag and provide the script with the variables needed to generated the interactive annotated spectrum
 * @example <div annotated-spectrum plotdata="set.plotData" peptide="set.peptide" settings="set.settings" class="content"></div>
 * @returns {object} The directive.
 */
angular.module("IPSA.directive2", []).directive("densityPlot", function($log) {
	console.log("blabla");

	/**
	 * @description The directive variable used to the initiate the 2-way binding between this template and the controller
	 * @property {string} directive.restrict - Restricts the directive to attribute and elements only
	 * @property {object} directive.scope - Holds objects containing spectral data, peptide data, and visualization settings
	 * @property {object} directive.scope.plotdata - Contains the numerical, ordinal, and categorical data required to generate the visualization
	 * @property {object} directive.scope.peptide - Contains ms2 scan number, peptide sequence, precursor mz, charge, and modifications
	 * @property {object} directive.scope.settings - Contains tolerance type (ppm/Da), tolerance threshold, and ionization mode
	 */
	var directive = {
		restrict: 'AE',
		scope: {
			sadata: '=?',
			densityoptions: '=?'
		}
	};

	/**
	 * @description Two arrays containing the unicode superscript and subscripts characters for numbers 0-10
	 */
	var superscript = ["\u2070", "\u00B9", "\u00B2", "\u00B3", "\u2074", "\u2075", "\u2076", "\u2077", "\u2078", "\u2079"];
	var subscript = ["\u2080", "\u2081", "\u2082", "\u2083", "\u2084", "\u2085", "\u2086", "\u2087", "\u2088", "\u2089"];


	/**
	 * @description Links the IPSA directive to the annotatedSpectrum HTML tag.
	 */
	directive.link = function(scope, elements, attr) {
		console.log(scope);
		console.log(scope.sadata);
		/**
		 * @description This function initializes the visualization elements. First an svg element is appended to the web page. Then container, or <g>, elements are appended inside the svg. 
		 *			Invisible rectangles are placed where the X- and Y-axes are to catch future zooming events. X- and Y-axis labels are placed, and the containers which will hold the svg elements
		 *			are placed. This function is chained to scope.setSvgSize.
		 */

		scope.do_plot = function(svg, sadata){
			var m = {top: 50, right: 50, bottom: 50, left: 50}
				, h = 500 - m.top - m.bottom
				, w = 960 - m.left - m.right
				, numBins = 100;
			var CUTOFF=1e-2;

			//Using a fixed data set for demo, rather than random generated values
			////TODO - update fixed data set later with a larger dataset for demo/testing (and
			//// feed in via d3.csv() or d3.json() )
			//
			if(sadata !== undefined){
				var dataset = sadata.sort((a, b) => a.similarity - b.similarity);
				//Draw svg
				svg	
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
				var xScale = d3.scale.linear().domain([0, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
				var kde = kernelDensityEstimator(kernelEpanechnikov(0.01), xScale.ticks(1000));
				var density = kde(dataset.map(function(d) {
					return d.similarity;
				}))
				// density.unshift([0,0]);
				density.unshift([0,CUTOFF]);
				console.log(density);




				var y_density_max = d3.max(density, d => d[1]);
				//var xScale = d3.scale.log().domain([1e-2, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
				//var xScale = d3.scale.linear().domain([0, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
				var yScaleDensity = d3.scale.linear().domain([0, y_density_max]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
				var yScaleDensity = d3.scale.log().domain([CUTOFF, y_density_max]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
				//var yScaleDensity = d3.scale.log().domain([CUTOFF,50]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))



				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient('bottom');


				var yAxis2 = d3.svg.axis()
					.scale(yScaleDensity)
					.orient('right');


				var xAxis = d3.svg.axis()
					.scale(xScale)
					.orient('bottom');


				var yAxis2 = d3.svg.axis()
					.scale(yScaleDensity)
					.orient('right');


				var pathHistogram = svg.append("path")
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
						.y(function(d) {
							if(d[1] <= CUTOFF){
								return(yScaleDensity(CUTOFF))
							}{
								return yScaleDensity(d[1]);
							}
						})
					);


				var POINT = dataset.filter(x=>x.hypothesis);
				svg.selectAll(".dotp")
					.data(POINT)
					.enter()                                                                                                                                                                                                                                                                                 .append("circle")
					.attr("class", "dot")
					.style("fill", "#C4071B")
					.attr("cx", function(d) {
						return xScale(d.similarity);
					})
					.attr("cy", function(d) {
						return yScaleDensity(CUTOFF);
					})
					.attr("r", 5);        

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
			}

		}

	      scope.clearOldLines = function () {
		var dataset = scope.plotContainer.selectAll(".line").data([]);
		dataset.exit().remove();
	      }
		scope.updateDate = function(dataset){
				var xScale = d3.scale.linear().domain([0, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
				var kde = kernelDensityEstimator(kernelEpanechnikov(0.01), xScale.ticks(1000));
				var density = kde(dataset.map(function(d) {
					return d.similarity;
				}))
				// density.unshift([0,0]);
				density.unshift([0,CUTOFF]);
				console.log(density);

		}
		scope.initialize = function() {
			console.log("initialize");
			console.log(scope.sadata);
			// get svg dimensions and settings
			var options = scope.getOptions(); // move to original
			// create svg element to hold charts
			scope.svgDensity = d3.select(elements[0]).append("svg").attr("class", "chartDensity");
			//.attr("width", options.renderSize.width)
			//.attr("height", options.renderSize.height);

			scope.do_plot(scope.svgDensity, scope.sadata);

			/*
				// svg element to show peptide sequence and fragment locations
			scope.titleContainer = scope.svgDensity.append("g").attr("id", "titleContainer");

// svg element to show summary data about peptide
			scope.peptideContainer = scope.svgDensity.append("g").attr("id", "peptideContainer");
// svg element to show correlation info about peptide
			scope.statisticsContainer = scope.svgDensity.append("g").attr("id", "statisticsContainer");

// main svg container to hold spectrum annotations
			scope.container = scope.svgDensity.append("g");
// main svg container to hold spectrum annotations
			scope.container2 = scope.svgDensity.append("g");

// last svg container to hold matched fragment ppm error
			scope.fragmentContainer = scope.svgDensity.append("g").attr("id", "fragmentContainer");

// container to hold annotated spectrum
			scope.plotContainer = scope.container.append("g").attr("id", "annotationContainer");

// set the svg size. this function scales the svg using the viewBox attribute.
			scope.setSvgSize(); 
			*/
};

/**
 * @description This function assigns a viewBox attribute to our SVG HTML tag. This is used to scale IPSA's annotated spectrum correctly independently of screen size and zoom level.
 * 		"The viewBox attribute defines the position and dimension, in user space, of an SVG viewport." https://developer.mozilla.org/en-US/docs/Web/SVG/Attribute/viewBox
 */
scope.setSvgSize = function() {
	var options = scope.getOptions();

	scope.svgDensity.attr('viewBox','0 0 '+ (options.svg.width + options.svg.margin.left + options.svg.margin.right) + ' ' +
		(options.svg.height + options.svg.margin.top + options.svg.margin.bottom))
		.attr('preserveAspectRatio','xMinYMin');

	// scope.redraw actually creates the axes and chart elements. 
	scope.redraw();
};

/**
 * @description Scope.redraw is called whenever the interactive annotated spectrum needs to be updated i.e. initialization or when data is updated. The contained functions 
 * 		procedurally draw the interactive annotated spectrum and the rest of the svg. 
 */
scope.redraw = function() {
	console.log("redraw");
	console.log(scope.sadata);
	scope.do_plot(scope.svgDensity, scope.sadata);
};


/**
 * @description The object defined in this method specifies the dimensions of the generated SVG. These can be edited to resize parts of the SVG. However, the perspective is forced into a 
 * 		viewbox so zooming on the page doesn't mess with rendering.
 * @property {object} options.svg - Defines the overall height, width, margins, and padding value of the total SVG. All other SVG elements are encompassed in this area.
 * @property {object} options.interactiveTitle - Dimensions used to generate the peptide sequence marked with the location of detected fragment ions
 * @property {object} options.statistics - Dimensions used to place the text elements "precursor m/z: #     Charge: #     Fragmented Bonds: "
 * @property {object} options.annotation - Dimensions used to generate the annotated mass spectrum. "zoomFactor" is the scalar value used to increment/decrement the aspect ratio when zooming.
 * @property {object} options.fragments - Dimensions used to generate the mass error dot chart below the annotated mass spectrum.
 * @returns {array} Plotting options.
 */
scope.getOptions = function() {
	return _.merge({
		svg: 
		{
			width: 700,
			height: 695,
			margin: 
			{
				top: 10,
				right: 15,
				bottom: 35,
				left: 60
			},
			padding: .05
		},
		renderSize:
		{
			width: 1080,
			height: 885
		},
	}, scope.densityoptions || { });
};

/**
 * @description These is the event handler which actually triggers the svg drawing event. The redraw function will trigger anytime there is a change in spectral data, detected peptide 
 * 		fragments, peptide sequence/charge, and settings/matching tolerances.
 */
scope.$watch('sadata', scope.redraw, true);
// scope.$watch('plotdata', test, true);
// scope.$watch('sadata', test, true);
//test();

// once all our drawing and rendering methods are defined, initialize the chart and let it sit. It will automatically populate with new data when the plothandler detects that the annotated 
// changes
scope.initialize();
};

// return the directive
return directive; 
});
