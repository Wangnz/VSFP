class ScatterPlot {
	constructor () {
		this.input_data = null;
		this.xscale = null;
		this.yscale = null;
		this.svg_width = $(".div-scatterPlot").width();
		this.svg_height = $(".div-scatterPlot").height();
		this.color = d3.scaleOrdinal(d3.schemeCategory10);
	}

	update_data(input_data) {
		this.input_data = input_data;
	}

	make_plot() {
		var _this = this;
		/*
		d3.select(".xaxis-scatterPlot").remove();
		d3.select(".yaxis-scatterPlot").remove();
		d3.select(".xlabel-scatterPlot").remove();
		*/
		d3.select("#subsvg-scatterPlot").remove();
		
		var xmin = Infinity, xmax = 0;
		var ymin = Infinity, ymax = 0;
		for (var i = 0; i < this.input_data.length; i++) {
			if (!isNaN(d3.min(this.input_data[i]['xaxis']))) {
				xmin = Math.min(xmin, d3.min(this.input_data[i]['xaxis']));
				xmax = Math.max(xmax, d3.max(this.input_data[i]['xaxis']));
			}
			if (!isNaN(d3.max(this.input_data[i]['yaxis']))) {
				ymin = Math.min(ymin, d3.min(this.input_data[i]['yaxis']));
				ymax = Math.max(ymax, d3.max(this.input_data[i]['yaxis']));
			}
		}

		
		this.xscale = d3.scaleLinear()
		  .domain([xmin, xmax])
		  .range([0.15 * this.svg_width, 0.95 * this.svg_width]);

		this.yscale = d3.scaleLinear()
		  .domain([ymin, ymax])
		  .range([0.8 * this.svg_height, 0.1 * this.svg_height]);

		var subsvg = svg_scatterPlot.append("svg")
		  .attr("id", "subsvg-scatterPlot")
		  .attr("width", "100%")
		  .attr("height", "100%");

		subsvg.append("g")
		  .attr("transform", "translate(0," + 0.8 * this.svg_height + ")")
		  .attr("class", "xaxis-scatterPlot")
	  	  .call(d3.axisBottom(this.xscale).tickFormat(d3.format(".2s")));

		subsvg.append("g")
	  	  .attr("transform", "translate(" + (0.15 * this.svg_width) + ",0)")
	  	  .attr("class", "yaxis-scatterPlot")
		  .call(d3.axisLeft(this.yscale).tickFormat(d3.format(".3s")));

		subsvg.append("text")
		  .attr("class", "xlabel-scatterPlot")
		  .attr("x", 0.5 * this.svg_width)
		  .attr("y", 0.9 * this.svg_height)
		  .style("text-anchor", "middle")
		  .text(d3.select("#subtopicSelect option:checked").text());

		subsvg.append("text")
		  .attr("class", "ylabel-scatterPlot")
		  .attr("transform", "rotate(-90)")
		  .attr("x", -0.5 * this.svg_height)
		  .attr("y", 0.05 * this.svg_width)
		  .style("text-anchor", "middle")
		  .text("GDP per capita ($US)");

		this.updateScatter(1960);
	}

	updateScatter (year) {
		d3.selectAll(".dot").remove();

		var subsvg = d3.select("#subsvg-scatterPlot");
		var _this = this;

		var norm_radius = this.standardize(this.input_data, year);

		subsvg.selectAll(".dot")
		  .data(this.input_data).enter()
		  .append("circle")
		  .attr("r", function(d) {
		  	if (isNaN(norm_radius[d['country']])) return 0;
		  	else return Math.sqrt(100*norm_radius[d['country']]);
		  })
		  .attr("class", "dot")
		  .attr("cx", function(d) {
		  	if (!isNaN(d['xaxis'][year - 1960]))
		  		return _this.xscale(d['xaxis'][year - 1960]);
		  	else return -100;
		  })
		  .attr("cy", function(d) {
		  	if (!isNaN(d['yaxis'][year - 1960]))
		  		return _this.yscale(d['yaxis'][year - 1960])
		  	else return -100;
		  })
		  .style("fill", function(d) {return _this.color(d['country'])})	
	}

	normalize(input_data, year) {
		var r_max = 0, r_min = Infinity;
		for (var i = 0; i < input_data.length; i++) {
			if (!isNaN(input_data[i]['radius'][year - 1960])) {
				r_min = Math.min(r_min, input_data[i]['radius'][year - 1960]);
				r_max = Math.max(r_max, input_data[i]['radius'][year - 1960]);
			}
		}

		var norm_radius = {};
		for (var i = 0; i < input_data.length; i++) 
			norm_radius[input_data[i]['country']] = (input_data[i]['radius'][year - 1960] - r_min) / (r_max - r_min);
		
		return norm_radius;
	}

	standardize(input_data, year) {
		var r_arr = [];
		for (var i = 0; i < input_data.length; i++) {
			if (!isNaN(input_data[i]['radius'][year - 1960])) {
				r_arr.push(input_data[i]['radius'][year - 1960]);
			}
		}
		var r_mean = r_arr.reduce((partial_sum, a) => partial_sum + a,0) / r_arr.length;
		var r_std = this.standardDeviation(r_arr);

		var norm_radius = {};
		var norm_min = Infinity;
		var new_value;
		for (var i = 0; i < input_data.length; i++) {
			if (!isNaN(input_data[i]['radius'][year - 1960])){
				new_value = (input_data[i]['radius'][year - 1960] - r_mean) / r_std;
				norm_radius[input_data[i]['country']] = new_value;
				norm_min = d3.min([norm_min, norm_radius[input_data[i]['country']]]);
			}
		}
		for (var country in norm_radius) {
			norm_radius[country] += Math.abs(norm_min);
		}

		return norm_radius
	}

	standardDeviation(values) {
        const average = (data) => data.reduce((sum, value) => sum + value, 0) / data.length;
        
        const avg = average(values);
        const diffs = values.map((value) => value - avg);
        const squareDiffs = diffs.map((diff) => diff * diff);
        const avgSquareDiff = average(squareDiffs);
        return Math.sqrt(avgSquareDiff);
};

}