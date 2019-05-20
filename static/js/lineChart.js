class LineChart {
	constructor() {
		this.input_data = null;
		this.year_array = null;
		
		this.xscale = null;
		this.yscale = null;
		this.line = null;

		this.color = d3.scaleOrdinal(d3.schemeCategory10);

		this.brush = null;
		this.prev_left_bound = null;
		this.prev_right_bound = null;
	}

	update_data(input_data, year_array) {
		this.input_data = input_data;
		this.year_array = year_array;
	}

	link_to_parCoorPlot(parCoorPlot_obj) {
		this.parCoorPlot = parCoorPlot_obj;
	}

	make_plot() {
		d3.select("#subsvg-lineChart-plot").remove();
		var _this = this;
		var ymin = Infinity, ymax = 0; 
		
		for (var i = 0; i < this.input_data.length; i++) {
			if (!isNaN(d3.min(this.input_data[i]['data']))){
				ymin = Math.min(ymin, d3.min(this.input_data[i]['data']));
				ymax = Math.max(ymax, d3.max(this.input_data[i]['data']));
			}
		}

		var svg_width = $(".div-lineChart-plot").width();
		var svg_height = $(".div-lineChart-plot").height();

		var subsvg = svg_lineChart.append("svg")
		  .attr("id", "subsvg-lineChart-plot")
		  .attr("width", "100%")
		  .attr("height", "100%");

		/*
		d3.select(".div-lineChart-plot")
		  .append("svg")
		  .attr("preserveAspectRatio", "xMinYMin meet")
		  .attr("viewBox", "0 0" + " " + WIDTH + " " + (HEIGHT*2))
		  .attr("class", "svg-content-responsive")
		  .attr("id", "subsvg-lineChart")
		*/
		  
		var x_domain = d3.extent(this.year_array, function(d) {return d; });
		this.xscale = d3.scaleLinear()
		  .domain(x_domain)
		  .range([0.1*svg_width, 0.9*svg_width]);

		this.yscale = d3.scaleLinear()
	 	  .domain([ymin, ymax])
		  .range([svg_height, 0]);
  
		subsvg.append("text")
		  .attr("transform", "rotate(-90)")
		  .attr("y", 0.05 * svg_width)
		  .attr("x", -0.5 * svg_height)
		  .style("text-anchor", "middle")
		  .text(d3.select("#subtopicSelect option:checked").text())
		  .attr("font-size", 14)

		subsvg.append("g")
		  .attr("class", "xaxis-lineChart")
		  .attr("transform", "translate(0,"+(svg_height)+")")
		  .call(d3.axisBottom(this.xscale));

		subsvg.append("g")
		  .attr("class", "yaxis-lineChart")
		  .attr("transform", "translate(" + (0.1 * svg_width) + ", 0)")
		  .call(d3.axisLeft(this.yscale).tickFormat(d3.format(".0s")));

		this.line = d3.line()
		  .defined(function(d) {return d; })
		  .x(function(d, i) {return _this.xscale(_this.year_array[i]); })
		  .y(function(d) {return _this.yscale(d); });

		var line_svg = subsvg.selectAll(".line_svg")
		  .data(this.input_data)
		  .enter().append("g")
		  .attr("class", "line_svg");

		line_svg.append("path")
		  .datum(function(d) {return d['data']; })
		  .attr("class", "line")
		  .attr("d", this.line)
		  .attr("stroke-width", "1")
		  .attr("stroke", function(d, i) {return _this.color(i); })
		  .attr("fill", "none");

		
		// Legend
		var rect_size = 13, text_height = 14;
		var caption_x = 0, caption_y = rect_size;
		var column_start = 50;
		var column_width = (svg_width * 0.9 - column_start) / Object.keys(this.input_data).length;
		
		/*
		var rect_x = 50, rect_y = 0;
		var country_x = rect_x + rect_size, country_y = 0;
		var coutry_width = 40;
		var rect_country_width = 70;
		var value_x = rect_x + rect_size + 28;
		var value_y = caption_y;
		*/
		d3.select(".dashboard_svg").remove();

		var dashboard_svg = d3.select(".div-dashboard")
		  .append("svg")
		  .attr("class", "dashboard_svg")
		  .attr("width", "100%");

		var caption = dashboard_svg.selectAll(".caption")
		  .data(["avg", "max", "min"]).enter()
		  .append("text")
		  .attr("class", "legend_elem")
		  .attr("x", caption_x)
		  .attr("y", function(d, i) {return caption_y + i * text_height})
		  .attr("alignment-baseline", "hanging")
		  .text(function(d) {return d; });

		var legend = dashboard_svg.selectAll(".legend")
		  .data(this.input_data).enter()
		  .append("g")
		  .attr("class", "legend")
		  .attr("x", (column_start + i * column_width))

		legend.append("rect")
		  .attr("class", "legend_elem")
		  .attr("x", function(d, i) {
		  	if (_this.input_data.length >= 10) {
		  		return column_start + (i+1) * column_width - 32;
		  	}
		  	else return column_start + (i+1) * column_width - 41;})
		  .attr("y", 0)
		  .attr("width", rect_size)
		  .attr("height", rect_size*0.8)
		  .style("fill", function(d, i) {return _this.color(i); });

		legend.append("text")
		  .attr("class", "legend_elem")
		  .attr("x", function(d, i) {return column_start + (i+1) * column_width;})
		  .attr("y", 0)
		  .attr("alignment-baseline", "hanging")
		  .style("text-anchor", "end")
		  .text(function(d) {return d["country"]; })
		  .attr("font-size", function() {
		  	if (_this.input_data.length >= 10) {
		  		return 9;
		  	}
		  	else return 12;
		  });

		legend.append("text")
		  .attr("class", "average legend_elem")
		  .attr("x", function(d, i) {return column_start + (i+1) * column_width})
		  .attr("y", caption_y)
		  .attr("alignment-baseline", "hanging")
		  .style("text-anchor", "end")
		  .attr("font-size", function () {
		  	if (_this.input_data.length >= 10) {
		  		return 10;
		  	}
		  	else return 14;
		  });
		
		legend.append("text")
		  .attr("class", "max legend_elem")
		  .attr("x", function(d, i) {return column_start + (i+1) * column_width})
		  .attr("y", caption_y + text_height)
		  .attr("alignment-baseline", "hanging")
		  .style("text-anchor", "end")
		  .attr("font-size", function() {
		  	if (_this.input_data.length >= 10) {
		  		return 10;
		  	}
		  	else return 14;
		  });
		
		legend.append("text")
		  .attr("class", "min legend_elem")
		  .attr("x", function(d, i) {return column_start + (i+1) * column_width})
		  .attr("y", caption_y + 2 * text_height)
		  .attr("alignment-baseline", "hanging")
		  .style("text-anchor", "end")
		  .attr("font-size", function() {
		  	if (_this.input_data.length >= 10) {
		  		return 10;
		  	}
		  	else return 14;
		  });

		this.update_dashboard (1960, 2018);

		this.create_brush();
	}

	create_brush () {
		var svg_width = $(".div-lineChart-plot").width();
		var svg_height = $(".div-lineChart-plot").height();

		this.brush = d3.brushX()
		  .extent([[0.1 * svg_width, 0], [0.9 * svg_width, svg_height]])
		  .on("start", brush_start)
		  .on("brush", brush_move)
		  .on("end", brush_end);

		var subsvg = d3.select("#subsvg-lineChart-plot");

		subsvg.append("g")
		  .attr("class", "brush")
		  .style("opacity", 0.4)
		  .call(this.brush);

		var _this = this;
		function brush_start() {

			var line_svg = d3.selectAll(".line_svg");
			var extent = d3.event.selection.map(_this.xscale.invert);
			var left_bound = Math.round(d3.min(extent));
			var right_bound = Math.round(d3.max(extent));

			if (left_bound == right_bound) {
				line_svg.selectAll(".line").style("opacity", 1);
				line_svg.selectAll(".brush_line").remove();
			}

			else if (left_bound != _this.prev_left_bound || right_bound != _this.prev_right_bound)
				line_svg.selectAll(".brush_line").remove();
		}

		function brush_end() {
			if (!d3.event.sourceEvent){
				return;
			}
			if (!d3.event.selection) {
				d3.selectAll(".line_svg").selectAll(".brush_line").remove();
				d3.selectAll(".line_svg").selectAll(".line").style("opacity", 1);
				_this.parCoorPlot.cancel_linking();
				_this.update_dashboard (1960, 2018);
				return;
			}

			var extent = d3.event.selection.map(_this.xscale.invert);
			var left_bound = Math.round(d3.min(extent));
			var right_bound = Math.round(d3.max(extent));
			_this.prev_left_bound = left_bound;
			_this.prev_right_bound = right_bound;

			if (left_bound < right_bound){
				// ref: https://bl.ocks.org/SpaceActuary/2f004899ea1b2bd78d6f1dbb2febf771
				d3.select(this).transition().call(d3.event.target.move, [left_bound, right_bound].map(_this.xscale));			}

			_this.parCoorPlot.linking(left_bound, right_bound);
		}

		function brush_move() {
			var line_svg = d3.selectAll(".line_svg");
			var svg_width = $(".div-lineChart-plot").width();
			
			var extent = d3.event.selection.map(_this.xscale.invert);
			var left_bound = Math.round(d3.min(extent));
			var right_bound = Math.round(d3.max(extent));

			_this.update_dashboard (left_bound, right_bound);
			_this.parCoorPlot.cancel_linking();
			_this.parCoorPlot.linking(left_bound, right_bound);
			
			if (_this.prev_left_bound < left_bound || _this.prev_right_bound > right_bound) {
				line_svg.selectAll(".brush_line").remove();
			}

			line_svg.selectAll(".line")
			  .style("opacity", 0.3);

			line_svg.append("path")
			  .datum(function(d) {return d['data'].slice(left_bound-1960, right_bound-1960+1)})
			  .attr("class", "brush_line")
			  .attr("d", _this.line)
			  .attr("stroke-width", "1")
			  .attr("stroke", function(d, i) {return _this.color(i); })
			  .attr("fill", "none")
			  .attr("transform", "translate(" + (_this.xscale(left_bound) - 0.1 * svg_width) + ", 0)");
			left_bound = _this.prev_left_bound;
			right_bound = _this.prev_right_bound;
		}
	}

	update_dashboard (left_bound, right_bound) {
		d3.selectAll(".legend")
		  .selectAll(".average")
		  .text(function(d) {
		  	var new_value;
		  	try {
		  		new_value = d3.mean(d['data'].slice(left_bound-1960, right_bound-1960+1)).toFixed(0);
		  		if (new_value >= 1000000){
		  			new_value = parseInt(new_value).toExponential(2);
		  		}
		  	} catch (err) {
		  		new_value = "-";
		  	}
		  	return new_value;
		  });

		d3.selectAll(".legend")
		  .selectAll(".max")
		  .text(function(d) {
		  	var new_value;
		  	try {
		  		new_value = d3.max(d['data'].slice(left_bound-1960, right_bound-1960+1)).toFixed(0);
		  		if (new_value >= 1000000){
		  			new_value = parseInt(new_value).toExponential(2);
		  		}
		  	} catch(err) {
		  		new_value = "-";
		  	}
		  	return new_value;
		  });

		d3.selectAll(".legend")
		  .selectAll(".min")
		  .text(function(d) {
		  	var new_value;
		  	try {
		  		new_value = d3.min(d['data'].slice(left_bound-1960, right_bound-1960+1)).toFixed(0);
		  		if (new_value >= 1000000){
		  			new_value = parseInt(new_value).toExponential(2);
		  		}
		  	} catch(err) {
		  		new_value = "-";
		  	}
		  	return new_value;
		  });
	}
}

/*
function makeLineChart(input_data, year_array) {
	
	d3.select("#subsvg").remove();

	var ymin = Infinity, ymax = 0; 
	
	for (var i = 0; i < input_data.length; i++) {
		ymin = Math.min(ymin, d3.min(input_data[i]['data']));
		ymax = Math.max(ymax, d3.max(input_data[i]['data']));
	}

	var subsvg = svg.append("svg")
	  .attr("id", "subsvg")
      .attr("width", "100%")
  	  .attr("height", "100%");

	// var color = d3.scaleOrdinal(d3.schemeCategory10)
	
	var x_domain = d3.extent(year_array, function(d) {return d; });
	var xscale = d3.scaleLinear()
	  .domain(x_domain)
	  .range([100, WIDTH]);

	var yscale = d3.scaleLinear()
 	  .domain([ymin, ymax])
	  .range([HEIGHT, 0]);

	var brush = d3.brushX()
	  .extent([[100, 0], [WIDTH, HEIGHT]])
	  .on("start", brush_start)
	  .on("brush", brush_move)
	  .on("end", brush_end);
	  
	subsvg.append("text")
	  .attr("transform", "rotate(-90)")
	  .attr("y", margin.left / 2)
	  .attr("x", 0 - (HEIGHT/2))
	  .attr("dy", "1em")
	  .style("text-anchor", "middle")
	  .text(d3.select("#subtopicSelect option:checked").text());

	subsvg.append("g")
	  .attr("class", "xaxis")
	  .attr("transform", "translate(0,"+(HEIGHT)+")")
	  .call(d3.axisBottom(xscale));

	subsvg.append("g")
	  .attr("class", "yaxis")
	  .attr("transform", "translate(100, 0)")
	  .call(d3.axisLeft(yscale).tickFormat(d3.format(".0s")));

	var line = d3.line()
	  .defined(function(d) {return d; })
	  .x(function(d, i) {return xscale(year_array[i]); })
	  .y(function(d) {return yscale(d); });

	var line_svg = subsvg.selectAll(".line_svg")
	  .data(input_data)
	  .enter().append("g")
	  .attr("class", "line_svg");

	line_svg.append("path")
	  .datum(function(d) {return d['data']; })
	  .attr("class", "line")
	  .attr("d", line)
	  .attr("stroke-width", "2")
	  .attr("stroke", function(d, i) {return color(i); })
	  .attr("fill", "none");

	subsvg.append("g")
	  .attr("class", "brush")
	  .style("opacity", 0.4)
	  .call(brush);


	var prev_left_bound, prev_right_bound;
	function brush_start() {
		var extent = d3.event.selection.map(xscale.invert);
		var left_bound = Math.round(d3.min(extent));
		var right_bound = Math.round(d3.max(extent));

		if (left_bound == right_bound) {
			line_svg.selectAll(".line").style("opacity", 1);
			line_svg.selectAll(".brush_line").remove();
		}

		else if (left_bound != prev_left_bound || right_bound != prev_right_bound)
			line_svg.selectAll(".brush_line").remove();
	}

	function brush_end() {
		if (!d3.event.sourceEvent || !d3.event.selection) return;

		var extent = d3.event.selection.map(xscale.invert);
		var left_bound = Math.round(d3.min(extent));
		var right_bound = Math.round(d3.max(extent));
		prev_left_bound = left_bound;
		prev_right_bound = right_bound;

		if (left_bound < right_bound){
			// ref: https://bl.ocks.org/SpaceActuary/2f004899ea1b2bd78d6f1dbb2febf771
			d3.select(this).transition().call(d3.event.target.move, [left_bound, right_bound].map(xscale));
		}

		par_coor_plot.linking(left_bound, right_bound);
	}

	function brush_move() {
		var extent = d3.event.selection.map(xscale.invert);
		var left_bound = Math.round(d3.min(extent));
		var right_bound = Math.round(d3.max(extent));
		
		if (prev_left_bound < left_bound || prev_right_bound > right_bound) {
			line_svg.selectAll(".brush_line").remove();
		}

		line_svg.selectAll(".line")
		  .style("opacity", 0.3);

		line_svg.append("path")
		  .datum(function(d) {return d['data'].slice(left_bound-1960, right_bound-1960+1)})
		  .attr("class", "brush_line")
		  .attr("d", line)
		  .attr("stroke-width", "3")
		  .attr("stroke", function(d, i) {return color(i); })
		  .attr("fill", "none")
		  .attr("transform", "translate(" + (xscale(left_bound) - 100) + ", 0)");

		left_bound = prev_left_bound;
		right_bound = prev_right_bound;
	}

	// Legend
	var legend = subsvg.selectAll(".legend")
	  .data(input_data).enter()
	  .append("g")
	  .attr("class", "legend")
	  .attr("transform", function(d, i) {
	  	if (i == 0) {
	  		return "translate(0,"+ (HEIGHT+50) + ")";
	  	}
	  	else {
	  		var offset = i * 20;
	  		return "translate(" + (offset) + "," + (HEIGHT+50) + ")";
	  	}
	});

	legend.append("rect")
	  .attr("x", function(d, i) {return 100 + i * 50;})
	  .attr("y", 0)
	  .attr("width", 18)
	  .attr("height", 18)
	  .style("fill", function(d, i) {return color(i); });

	legend.append("text")
	  .attr("x", function(d, i) {return 100 + i * 50 + 20;})
	  .attr("y", 9)
	  .attr("dy", ".35em")
	  .style("text-anchor", "start")
	  .text(function(d) {return d["country"]; });
}
*/
