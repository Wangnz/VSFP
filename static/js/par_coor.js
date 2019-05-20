class ParCoorPlot {
	constructor() {
		this.input_data = null;
		this.income = null;
		this.country = null;
		this.features = null;

		this.xscale = null;
		this.yscales = null;

		this.color = d3.scaleSequential()
		  .interpolator(d3.interpolateViridis)
		  .domain([0, 60]);

		this.x_leftBound = WIDTH * 0.05;
		this.x_rightBound = WIDTH * 0.9;
		this.y_upBound = 0;
		this.y_bottomBound = HEIGHT*0.8;
	}

	update_data(input_data, income, country, features) {
		this.input_data = input_data;
		this.income = income;
		this.country = country;
		this.features = features;
	}

	link_to_lineChart(lineChart_obj) {
		this.lineChart = lineChart_obj;
	}

	make_plot() {
		// makeParCoorPlot(this.input_data, this.income, this.country, this.features);
		d3.select("#subsvg-parCoorPlot").remove();

		var subsvg = svg_parCoorPlot.append("svg")
		  .attr("id", "subsvg-parCoorPlot")
		  .attr("width", "100%")
		  .attr("height", "100%");

		/*
		var color = d3.scaleSequential()
		  .interpolator(d3.interpolateViridis)
		  .domain([0,60]);
		*/

		var dimensions = this.features;
		
		this.xscale = d3.scalePoint()
		  .range([this.x_leftBound, this.x_rightBound])
		  .padding(0.4)
		  .domain(dimensions);

		this.yscales = {};
		for (var i = 0;  i < dimensions.length; i++) {
			this.yscales[dimensions[i]] = d3.scaleLinear()
			  .range([this.y_bottomBound, this.y_upBound]).nice();

			if (dimensions[i] == "SP.DYN.CDRT.IN" || dimensions[i] == "SP.DYN.CBRT.IN")
				this.yscales[dimensions[i]].domain([0, 50]);
			else if (dimensions[i] == "SP.DYN.LE00.IN")
				this.yscales[dimensions[i]].domain([40, 100]);
			else if (dimensions[i] == "SP.POP.GROW")
				this.yscales[dimensions[i]].domain([-10, 10]);
			else {
				this.yscales[dimensions[i]].domain(getExtentWithNaN(this.input_data[this.country][dimensions[i]]))
			}
		}

		var input_data_arr = [];
		for(var i = 1960; i <= 2018; i++)
			input_data_arr.push({});

		for (var f in this.input_data[this.country]) {
			for (var i = 0; i < this.input_data[this.country][f].length; i++) {
				input_data_arr[i][f] = this.input_data[this.country][f][i];
			}
		}

		var _this = this;
		function path(d) {
			return d3.line()
				.defined(function(d) {return d; })
				(dimensions.map(function(p) {
				if (!isNaN(d[p])){
					return [_this.xscale(p), _this.yscales[p](d[p])]; 
				}
			}));
		}

		// Draw the lines
		subsvg.selectAll(".path")
		  .data(input_data_arr).enter()
		  .append("path")
		  .attr("class", "path")
		  .attr("d", path)
		  .attr("transform", "translate(0," + HEIGHT*0.4 + ")")
		  .style("fill", "none")
		  .style("stroke", function(d, i) {return _this.color(i); })
		  .style("stroke-width", "1")
	  	  .style("opacity", 0.4);

	  	// Draw the axis
	  	subsvg.selectAll(".axis")
	  	  .data(dimensions).enter()
	  	  .append("g")
	  	  .attr("transform", function(d) {return "translate(" + _this.xscale(d) + "," + HEIGHT*0.4 + ")"; })
	  	  .each(function(d) {d3.select(this).call(d3.axisLeft().tickFormat(d3.format(".4")).scale(_this.yscales[d])); })
	  	  .append("text")
	  	  .style("text-anchor", "start")
	  	  .text(function(d) {return encode2Name(d); })
	  	  .attr("transform", "rotate(-40)")
	  	  .attr("y", -9)
	  	  .attr("font-size", 8)
	  	  .style("fill", "black");

	  	/*
	  	subsvg.append("text")
	  	  .style("text-anchor", "middle")
	  	  .attr("transform", "translate(" + (WIDTH/2) + "," + (HEIGHT) + ")")
	  	  .text(this.income + ", " + this.country)
	  	  .attr("font-size", "12");
		*/
	}

	linking(start_year, end_year) {
		var subsvg = d3.select("#subsvg-parCoorPlot");

		var _this = this;
		function path(d) {
			return d3.line()
				.defined(function(d) {return d; })
				(_this.features.map(function(p) {
				if (!isNaN(d[p])){
					return [_this.xscale(p), _this.yscales[p](d[p])]; 
				}
			}));
		}
		
		var brush_line_data_arr = [];
		for(var i = start_year; i <= end_year; i++)
			brush_line_data_arr.push({});
		
		for (var f in this.input_data[this.country]) {
			for (var i = start_year - 1960; i <= end_year - 1960; i++) {
				brush_line_data_arr[i - (start_year - 1960)][f] = this.input_data[this.country][f][i];
			}
		}

		subsvg.selectAll(".path")
		  .style("opacity", 0.05);

		subsvg.selectAll(".brush_path")
		  .append("path")
		  .data(brush_line_data_arr).enter()
		  .append("path")
		  .attr("d", path)
		  .attr("class", "brush_path")
		  .attr("transform", "translate(0," + HEIGHT*0.4 + ")")
		  .style("fill", "none")
		  .style("stroke", function(d, i) {return _this.color(i + (start_year - 1960)); })
		  .style("stroke-width", "1")
	  	  .style("opacity", 0.7);
	}

	cancel_linking () {
		var subsvg = d3.select("#subsvg-parCoorPlot");

		subsvg.selectAll(".brush_path").remove();
		subsvg.selectAll(".path").style("opacity", 0.4);
	}

	brush_start() {

	}

	brush_move() {
		
	}

	brush_end() {
		if (!d3.event.sourceEvent) return;
  		if (!d3.event.selection) return;

  		var extent = d3.event.selection.map(this.yscales[this.features[0]].invert);

  		console.log(extent);
  		var round_extent = extent.map(d3.round);

		d3.select(this.brush).transition().call(d3.event.target.move, round_extent.map(this.yscales[this.features[0]]));
	}
}

/*
function makeParCoorPlot(input_data, income, country, features) {

	d3.select("#subsvg2").remove();

	var subsvg = svg2.append("svg")
	  .attr("id", "subsvg2")
	  .attr("width", "100%")
	  .attr("height", "100%");

	// var color = d3.scaleOrdinal(d3.interpolateViridis)
	var color = d3.scaleSequential()
	  .interpolator(d3.interpolateViridis)
	  .domain([0,60]);

	var dimensions = features; // Object.keys(input_data[country]);
	
	var xscale = d3.scalePoint()
	  .range([WIDTH*0.2, WIDTH*0.8])
	  .padding(1)
	  .domain(dimensions);

	var yscales = {};
	for (var i = 0;  i < dimensions.length; i++) {
		yscales[dimensions[i]] = d3.scaleLinear()
		  .range([HEIGHT*2/3, 0]).nice();

		if (dimensions[i] == "SP.DYN.CDRT.IN" || dimensions[i] == "SP.DYN.CBRT.IN")
			yscales[dimensions[i]].domain([0, 50]);
		else if (dimensions[i] == "SP.DYN.LE00.IN")
			yscales[dimensions[i]].domain([40, 100]);
		else if (dimensions[i] == "SP.POP.GROW")
			yscales[dimensions[i]].domain([-10, 10]);
		else {
			yscales[dimensions[i]].domain(getExtentWithNaN(input_data[country][dimensions[i]]))
		}
	}

	var input_data_arr = [];
	for(var i = 1960; i <= 2018; i++)
		input_data_arr.push({});

	for (var f in input_data[country]) {
		for (var i = 0; i < input_data[country][f].length; i++) {
			input_data_arr[i][f] = input_data[country][f][i];
		}
	}

	function path(d) {
		return d3.line()
			.defined(function(d) {return d; })
			(dimensions.map(function(p) {
			if (!isNaN(d[p])){
				return [xscale(p), yscales[p](d[p])]; 
			}
		}));
	}

	// Draw the lines
	subsvg.selectAll(".path")
	  .data(input_data_arr).enter()
	  .append("path")
	  .attr("d", path)
	  .attr("transform", "translate(0, 100)")
	  .style("fill", "none")
	  .style("stroke", function(d, i) {return color(i); })
	  .style("stroke-width", "1")
  	  .style("opacity", 0.4);

  	// Draw the axis
  	subsvg.selectAll(".axis")
  	  .data(dimensions).enter()
  	  .append("g")
  	  .attr("transform", function(d) {return "translate(" + xscale(d) + ", 100)"; })
  	  .each(function(d) {d3.select(this).call(d3.axisLeft().tickFormat(d3.format(".4")).scale(yscales[d])); })
  	  .append("text")
  	  .style("text-anchor", "start")
  	  .text(function(d) {return encode2Name(d); })
  	  .attr("transform", "rotate(-40)")
  	  .attr("y", -9)
  	  .style("fill", "black");

  	subsvg.append("text")
  	  .style("text-anchor", "middle")
  	  .attr("transform", "translate(" + (WIDTH/2) + "," + (HEIGHT+10) + ")")
  	  .text(income + ", " + country);
}
*/