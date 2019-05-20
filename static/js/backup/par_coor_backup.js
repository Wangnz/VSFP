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

  	/*
	var slider = d3.sliderBottom()
	  .min(1960).max(2018)
	  .width(WIDTH * 0.8)
	  .step(1)
	  .default(1960)
	  .on("onchange", val => updateBar(val));

	var gSlider = subsvg.append("g")
	  .attr("transform", "translate(" + (WIDTH*0.1) + "," + (HEIGHT+50) + ")");
	gSlider.call(slider);
	*/

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

function linking(start_year, end_year) {

	var subsvg = d3.select("#subsvg2");
}