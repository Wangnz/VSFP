function makeBarChart(input_data, year_array) {

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
	  .on("onchange", val => updateBar(val));

	var gSlider = subsvg.append("g")
	  .attr("transform", "translate(" + (WIDTH*0.1) + "," + (HEIGHT+50) + ")");
	gSlider.call(slider);

	var yscaleKey = [];
	for (var i = 0; i < input_data.length; i++)
		yscaleKey.push(input_data[i]['country']);

	var yscale = d3.scaleBand()
	  .domain(yscaleKey)
	  .range([0, HEIGHT])
	  .padding(0.1);

	subsvg.append("g")
	  .attr("class", "yaxis")
	  .attr("transform", "translate(" + (WIDTH*0.1) + ",0)")
	  .call(d3.axisLeft(yscale));

	var color = d3.scaleOrdinal(d3.schemeCategory10)
	  .domain(["full", "random", "strat"]);

	updateBar(1960);

	function updateBar(year) {
		d3.select(".xaxis").remove();
		d3.selectAll(".bar").remove();
		d3.select(".x-label").remove();
		d3.selectAll(".bar-label").remove();

		var xmin = Infinity, xmax = 0;
		for (var i = 0; i < input_data.length; i++) {
			if (!isNaN(input_data[i]['data'][year-1960])){
				xmin = Math.min(xmin, input_data[i]['data'][year-1960]);
				xmax = Math.max(xmax, input_data[i]['data'][year-1960]);
			}
		}

		var xscale = d3.scaleLinear()
	  	  .domain([0, xmax])
	  	  .range([0, WIDTH*0.8]).nice()

	  	subsvg.append("g")
	  	  .attr("class", "xaxis")
	  	  .attr("transform", "translate(" + (WIDTH*0.1) + "," + (HEIGHT) + ")")
	  	  .call(d3.axisBottom(xscale).tickFormat(d3.format(".2s")));

	  	subsvg.append("text")
	  	  .attr("class", "x-label")
		  .attr("x", (WIDTH/2))
		  .attr("y",  HEIGHT + 40)
		  .style("text-anchor", "middle")
		  .text(d3.select("#subtopicSelect option:checked").text());
	
	  	subsvg.selectAll(".bar")
	  	  .data(input_data).enter()
	  	  .append("rect")
	  	  .attr("class", "bar")
	  	  .attr("x", WIDTH*0.1)
	  	  .attr("y", function(d) {return yscale(d['country']); })
	  	  .attr("width", function(d) {
	  	  	var data = d['data'][year-1960]; 
	  	  	if (isNaN(d['data'][year-1960]))
	  	  		return 0
	  	  	else
	  	  		return xscale(d['data'][year-1960]); })
	  	  .attr("height", yscale.bandwidth())
	  	  .attr("fill", function(d, i) {return color(i); });

	  	subsvg.selectAll(".bar-label")
	  	  .data(input_data).enter()
	  	  .append("text")
	  	  .attr("class", "bar-label")
	  	  .attr("text-anchor", "start")
	  	  .attr("x", function(d) {return xscale(d['data'][year - 1960]) + 100; })
	  	  .attr("y", function(d) {return yscale(d['country']) + yscale.bandwidth() / 2; })
	  	  .text(function(d){
	  	  	if (!isNaN(d['data'][year-1960]))
	  	  		return d['data'][year-1960].toFixed(2); 
			else return "";
	  	  })
	}
}
