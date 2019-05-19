function makePieChart(input_data, year_array) {

	d3.select("#subsvg").remove();

	var subsvg = svg.append("svg")
	  .attr("id", "subsvg")
      .attr("width", "100%")
  	  .attr("height", "100%");

	var slider = d3.sliderBottom()
	  .min(1960).max(2018)
	  .width(WIDTH * 0.8)
	  .step(1)
	  .default(1960)
	  .on("onchange", val => updatePie(val));

	var gSlider = subsvg.append("g")
	  .attr("transform", "translate(" + (WIDTH*0.1) + "," + (HEIGHT+50) + ")");
	gSlider.call(slider);

	var color = d3.scaleOrdinal(d3.schemeCategory10)
	  .domain(["full", "random", "strat"]);

	var radius = Math.min(WIDTH, HEIGHT) * 0.4;
	
	var arc = d3.arc().outerRadius(radius*0.8).innerRadius(radius * 0.6);
	var labelArc = d3.arc().outerRadius(radius * 0.9).innerRadius(radius * 0.9);

	updatePie(1960);

	function updatePie(year) {

		d3.select(".pie").remove();

		var pie = d3.pie()
	  	  .value(function(d) {
	  	  	if (isNaN(d['data'][year - 1960])){
	  	  		return 0; 
	  		}
	  		else
	  			return d['data'][year - 1960];
	  	  })
	  	  .sort(null);

	  	var pieFrame = subsvg.append("g")
		  .attr("class", "pie")
		  .attr("transform", "translate(" + (WIDTH / 2) + "," + (50 + HEIGHT / 2) + ")");

		var slice = pieFrame.selectAll(".slice")
		  .data(pie(input_data)).enter()
		  .append("g")
		  .attr("class", "slice");

		slice.append("path")
		  .attr("d", arc)
		  .attr("fill", function(d, i) {return color(i); });

		var total = 0;
		for (var i = 0; i < input_data.length; i++) {
			if (!isNaN(input_data[i]['data'][year - 1960]))
				total += input_data[i]['data'][year - 1960];
		}
		
		slice.append("text")
		  .attr("transform", function(d, i) {
		  	var pos = labelArc.centroid(d);
		  	pos[0] = radius * 0.95 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1) + 30;
		  	pos[0] -= i * 30;
		  	return "translate(" + (pos) + ")";
		  })
		  .attr("dy", "0.35em")
		  .style("text-anchor", function(d) {return (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? "start" : "end"); })
		  .text(function(d) {return d.data['country'] + " (" + (d.data['data'][year-1960] *100 / total).toFixed(1) + "%)"; });

		var lineFrame = pieFrame.append("g")
		  .attr("class", "lines");

		var polyLine = lineFrame.selectAll("polyline")
		  .data(pie(input_data)).enter()
		  .append("polyline")
		  .attr("points", function(d, i) {
		  		var pos = labelArc.centroid(d);
		  		pos[0] = radius * 0.95 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1) + 30;
		  		pos[0] -= i * 30;
		  		return [arc.centroid(d), labelArc.centroid(d), pos];
		  })
		  .attr("fill", "none")
		  .attr("stroke", "black")
		  .attr("stroke-width", "1px")
		  .attr("opacity", ".6");

	}
}