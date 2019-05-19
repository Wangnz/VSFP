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

	var color = d3.scaleOrdinal(d3.schemeCategory10)
	  .domain(["full", "random", "strat"]);

	var x_domain = d3.extent(year_array, function(d) {return d; });
	var xscale = d3.scaleLinear()
	  .domain(x_domain)
	  .range([100, WIDTH]);

	var yscale = d3.scaleLinear()
 	  .domain([ymin, ymax])
	  .range([HEIGHT, 0]);

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
	  .attr("stroke-width", "3")
	  .attr("stroke", function(d, i) {return color(i); })
	  .attr("fill", "none");
	
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
