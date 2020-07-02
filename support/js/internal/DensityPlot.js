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

		generate_ecdf_data  = function(sadata){
			var dataset = sadata;
			var ticks = d3.range(1, dataset.length + 1);
			ys=  ticks.map((d) => 1 - d / dataset.length );
			var ecdf_data = ys.map((el, i) =>
				{ return {
					"x" : dataset[i].similarity,
					"precursorCharge" : dataset[i].precursorCharge,
					"sequence" : dataset[i].sequence,
					"ecdf": el,
					"hypothesis": dataset[i].hypothesis
				}
				});
			var MINIMAL_Y_VALUE = 1e-4;
			var scaleN = dataset.length;
			var h = 400;
			var w = 860;
			var x_min = d3.min(dataset, d=>d.similarity);
			var x_min = 1e-10;
			console.log(ecdf_data);
			var xScale = d3.scale.log().domain([x_min, 1]).range([0, w]);
			scope.svgElements.xScaleLog.domain([x_min, 1]);
			scope.svgElements.yScaleEcdfLog.domain([MINIMAL_Y_VALUE*scaleN, 1*scaleN]);
			ecdf_data = ecdf_data.filter((el) =>{return 0 !== el["ecdf"]});
			ecdf_data = ecdf_data.filter((el) =>{return 0 !== el["x"]});
			ecdf_data = ecdf_data.map((el,i) => {
				el.x_log = el["x"] == 0? 0 : Math.log10(el["x"]);
				el.ecdf_log = Math.log10(el["ecdf"]);
				el.id = i;
				return el;
			});


			var ecdfChart = scope.svgDensity.selectAll(".dot")
	//			.data(ecdf_data);
				.data(ecdf_data, d => d.id);
			ecdfChart.exit().remove();

			function precise(x) {
				  return Number.parseFloat(x).toPrecision(4);
			}

			//

			ecdfChart
				.enter()
				.append("circle")
				.attr("class", "dot")
				.merge(ecdfChart)
			/*
				.on("mouseover", function(d) {
					console.log(d);
					console.log(ecdf_data);
					scope.svgElements.div.transition()
						.duration(200)
						.style("opacity", .9);
					scope.svgElements.div.html(d.sequence + "<br/>"  +
						d.precursorCharge +"<br/>" +
						precise(d.x))
						.style("left", (d3v4.event.pageX) + "px")
						.style("top", (d3v4.event.pageY - 28) + "px");
				})
				.on("mouseout", function(d) {
					scope.svgElements.div.transition()
						.duration(500)
						.style("opacity", 0);
				})*/
				.transition()
				.duration(3000)
				.style("stroke-width", function(d){ return d.hypothesis? 10: 1})
				.style("fill", function(d) { return   scope.svgElements.yScaleEcdfLog(d["ecdf"]* scaleN) < scope.svgElements.yScaleEcdfLog(CUTOFF*scaleN)? "#679A1D":"#E37222AA"   ;})
				.style("stroke", function(d){ return d.hypothesis? "black": NaN})
				.attr("cx", function(d) {
					return scope.svgElements.xScaleLog(d["x"]);
				})
				.attr("cy", function(d) {
					return scope.svgElements.yScaleEcdfLog(d["ecdf"] * scaleN);
				})
				.attr("r", 5)
			;
				// scope.svgElements.yScaleEcdfLog.domain([1e-4, d3v4.max(barData,x=>x.count)]);

				scope.svgDensity.selectAll(".myYAxisRight")
					.transition()
					.duration(3000)
					.call(scope.svgElements.yAxisBar);

				scope.svgDensity.selectAll(".myXAxisTop")
					.transition()
					.duration(3000)
					.call(scope.svgElements.xAxisLog);

		}

		scope.do_plot_ecdf =function(svg, sadata){
			if(sadata !== undefined && sadata.length > 0){
			}
		}

		scope.do_plot = function(svg, sadata){
			console.log(sadata);

			//Using a fixed data set for demo, rather than random generated values
			////TODO - update fixed data set later with a larger dataset for demo/testing (and
			//// feed in via d3.csv() or d3.json() )
			//
			if(sadata !== undefined && sadata.length > 0){
				var groupBy = function(xs, key) {
					return xs.reduce(function(rv, x) {
						(rv[x[key]] = rv[x[key]] || []).push(x);
						return rv;
					}, {});
				};
				var barData = sadata.map(function(x){return {sa: Math.ceil(x.similarity * 100) / 100}});
				var barGrouped = barData.reduce(function (r, a) {
					r[a.sa] = r[a.sa] || [];
					r[a.sa].push(a);
					return r;
				}, Object.create(null));
				barData = Object.entries(barGrouped).map(function(x){return({sa:parseFloat(x[0]), count:x[1].length})});


				var dataset = sadata.sort((a, b) => a.similarity - b.similarity);

				//Draw svg


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
				var kde = kernelDensityEstimator(kernelEpanechnikov(0.01), scope.svgElements.xScale.ticks(1000));
				var density = kde(dataset.map(function(d) {
					return d.similarity;
				}))
				// density.unshift([0,0]);
				density.unshift([0,scope.svgElements.CUTOFF]);
				console.log(density);

				var y_density_max = d3.max(density, d => d[1]);

				var density_in = density.map(function(d){return {x:d[0], y:d[1]}});
				console.log(density_in);

				/*

				// var pathHistogram = svg.selectAll(".lineDensity")
				var pathHistogram = svg.selectAll(".lineDensity")
				//.data(density, function(d) {console.log(d); return {"x":d[0], "y":d[1]}});
					.data([density_in]);

				pathHistogram
					.enter()
					.append("path")
					.attr("class", "lineDensity")
					.merge(pathHistogram)
					.transition()
					.duration(3000)
					.attr("d",  d3v4.line()
						.x(function(d) { return scope.svgElements.xScale(d.x); })
						.y(function(d) {
							if(d.y<= scope.svgElements.CUTOFF){
								return(scope.svgElements.yScaleDensity(scope.svgElements.CUTOFF))
							}{
								return scope.svgElements.yScaleDensity(d.y);
							}
						})

					)
					.attr("fill", "#69b3a2")
					.attr("opacity", ".8")
					.attr("stroke", "#000")
					.attr("stroke-width", 1)
					.attr("stroke-linejoin", "round");
				*/


				var barChart = svg.selectAll(".bar")
					.data(barData, d=>d.sa);
				barChart.exit()
					.transition()
					.duration(500)
					.attr("height", 0)
					.remove();

				scope.svgElements.yScaleBar.domain([1e-4, d3v4.max(barData,x=>x.count)]);
				console.log(scope.svgElements.yScaleBar);
				barChart
					.enter()
					.append("rect")
					.attr("class", "bar")
					.attr("x", function(d) { return scope.svgElements.xScale(d.sa); })
					.merge(barChart)
					.transition()
					.duration(3000)
					.style("fill", "steelblue")
					.attr("x", function(d) { return scope.svgElements.xScale(d.sa); })
				// .attr("width", x.rangeBand())
					.attr("width",860 / 100)
				// .attr("y", function(d) { return y(d.value); })
					.attr("y", function(d) { return scope.svgElements.yScaleBar(d.count)})
				// .attr("height", function(d) { return height - y(d.value); });
					.attr("height", function(d) { return 400 - scope.svgElements.yScaleBar(d.count)});


				/*
				 *
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
					*/
				svg.selectAll(".myXAxisBottom")
					.transition()
					.duration(3000)
					.call(scope.svgElements.xAxis);

				scope.svgElements.yScaleDensity.domain([scope.svgElements.CUTOFF, y_density_max]);
				svg.selectAll(".myYAxisLeft")
					.transition()
					.duration(3000)
					.call(scope.svgElements.yAxis);


				generate_ecdf_data(sadata);

			}

		}

		scope.clearOldLines = function () {
			var dataset = scope.plotContainer.selectAll(".line").data([]);
			dataset.exit().remove();
		}
		scope.initialize = function() {
			console.log("initialize");
			scope.svgElements = {};
			console.log(scope.sadata);
			// get svg dimensions and settings
			var options = scope.getOptions(); // move to original
			// create svg element to hold charts
			var m = {top: 50, right: 50, bottom: 50, left: 50}
				, h = 500 - m.top - m.bottom
				, w = 960 - m.left - m.right
				, numBins = 100;
			scope.svgElements.CUTOFF=1e-2;
			scope.svgDensity = d3v4.select(elements[0]).append("svg").attr("class", "chartDensity")
				.attr("width", w + m.left + m.right)
				.attr("height", h + m.top + m.bottom)
				.append("g")
				.attr("transform", "translate(" + m.left + "," + m.top + ")");

			        scope.svgElements.div = d3.select("body").append("div")
			            .attr("class", "tooltip")
			            .style("opacity", 0);

			var height = h;
			// scope.svgDensity
			CUTOFF = 1e-2;
			scope.svgElements.xScale = d3v4.scaleLinear().domain([0, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
			scope.svgElements.xScaleLog = d3v4.scaleLog().domain([CUTOFF, 1]).range([0, w]); // TODO CALCULATE MINIMU AS min(log(dataset))
			// scope.svgElements.yScaleDensity = d3v4.scaleLinear().domain([0,1]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
			scope.svgElements.yScaleDensity = d3v4.scaleLog().domain([0,1]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
			scope.svgElements.yScaleBar = d3v4.scaleLog().domain([0,1]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
			scope.svgElements.yScaleEcdfLog = d3v4.scaleLog().domain([CUTOFF,1]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
			// var yScaleDensity = d3.scale.log().domain([CUTOFF, y_density_max]).range([h, 0]); // TODO CALCULATE MINIMU AS min(log(dataset))
			//
			scope.svgElements.xAxis = d3v4.axisBottom().scale(scope.svgElements.xScale);
			scope.svgElements.xAxisLog = d3v4.axisTop().scale(scope.svgElements.xScaleLog);


			scope.svgElements.yAxis = d3v4.axisLeft().scale(scope.svgElements.yScaleDensity);

			scope.svgElements.yAxisEcdfLog = d3v4.axisRight().scale(scope.svgElements.yScaleEcdfLog);

			scope.svgElements.yAxisBar = d3v4.axisLeft().scale(scope.svgElements.yScaleBar);
			scope.svgDensity.append("g").attr("class", "barStuff");.
			scope.svgDensity.append("g")
				.attr("class", "myXAxisBottom")
				.attr("transform", "translate(0," + height + ")")
			;
			scope.svgDensity.append("g")
				.attr("class", "myXAxisTop")
				.attr("transform", "translate(0," + 0 + ")")
			;

			scope.svgDensity.append("g")
				.attr("class", "myYAxisLeft");
			scope.svgDensity.append("g")
				.attr("class", "myYAxisRight")
				.attr("transform", "translate("+ w +" , 0)");



			scope.do_plot(scope.svgDensity, scope.sadata);
			// Function that change a color
			function changeColor() {
				var radioValue = $("input[name='colorButton']:active");
				console.log(radioValue)
				/*
				theCircles
					.transition()
					.style("fill", radioValue)
					*/
			}
			d3.select("#colorButton").on("change", changeColor )


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
