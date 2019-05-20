class BarChart {
	constructor() {
		this.input_data = null;

		this.svg_width = $(".div-barChart-pieChart").width();
		this.svg_height = $(".div-barChart-pieChart").height();

		this.color = d3.scaleOrdinal(d3.schemeCategory10);

		this.xscale = null;
		this.yscale = null;
	}

	update_data(input_data) {
		this.input_data = input_data;
	}

	make_plot(cur_year) {
		d3.select("#subsvg-barChart").remove();
		var subsvg = svg_barChart_pieChart.append("svg")
		  .attr("id", "subsvg-barChart")
		  .attr("width", "100%")
		  .attr("height", "100%");

		this.updateBar(cur_year);
	}

	updateBar (year) {
		d3.selectAll(".xaxis").remove();
		d3.selectAll(".yaxis").remove();
		d3.select(".x-label").remove();
		d3.selectAll(".bar-label").remove();
		
		var _this = this;
		var subsvg = d3.select("#subsvg-barChart");

		// sort the data
		this.input_data.sort(function(x1, x2) {
			var n1 = x1['data'][year-1960];
			var n2 = x2['data'][year-1960];
			if (isNaN(n1)) return 1;
			else if (isNaN(n2)) return -1;
			return n2 - n1;
		});

		var yscaleKey = [];
		for (var i = 0; i < this.input_data.length; i++)
			yscaleKey.push(this.input_data[i]['country']);

		this.yscale = d3.scaleBand()
		  .domain(yscaleKey)
	  	  .range([0.0 * this.svg_height, this.svg_height*0.75])
	      .padding(0.1);
	    
		subsvg.append("g")
	  	  .attr("class", "yaxis")
	  	  .attr("transform", "translate(" + (this.svg_width*0.1) + ",0)")
	  	  .call(d3.axisLeft(this.yscale));

	  	var xmin = Infinity, xmax = 0;
		for (var i = 0; i < this.input_data.length; i++) {
			if (!isNaN(this.input_data[i]['data'][year-1960])){
				xmin = Math.min(xmin, this.input_data[i]['data'][year-1960]);
				xmax = Math.max(xmax, this.input_data[i]['data'][year-1960]);
			}
		}

		this.xscale = d3.scaleLinear()
	  	  .domain([0, xmax])
	  	  .range([this.svg_width * 0.1 , this.svg_width * 0.95]).nice()

	  	subsvg.append("g")
	  	  .attr("class", "xaxis")
	  	  .attr("transform", "translate(0," + (0.75 * this.svg_height) + ")")
	  	  .call(d3.axisBottom(this.xscale).tickFormat(d3.format(".2s")));

	  	subsvg.append("text")
	  	  .attr("class", "x-label")
		  .attr("x", 0.5 * this.svg_width)
		  .attr("y", 0.85 * this.svg_height)
		  .style("text-anchor", "middle")
		  .text(d3.select("#subtopicSelect option:checked").text());

		var bars = subsvg
		  .selectAll(".bar")
		  .data(this.input_data);
		bars.exit().remove();

		bars.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", this.svg_width*0.1)
		  .merge(bars).transition().duration(500)
		  .attr("y", function (d) {return _this.yscale(d['country']);})
	  	  .attr("fill", function(d, i) {return _this.color(d['country']); })
	  	  .attr("width", function(d) {
	  	  	if (isNaN(d['data'][year-1960]))
	  	  		return 0;
	  	  	else
	  	  		return _this.xscale(d['data'][year-1960]) - 0.1 * _this.svg_width; })
	  	  .attr("height", this.yscale.bandwidth());

	  	subsvg.selectAll(".bar-label")
	  	  .exit().remove()
	  	  .data(this.input_data).enter()
	  	  .append("text")
	  	  .attr("class", "bar-label")
	  	  .attr("text-anchor", function (d) {
	  	  	if (_this.xscale(d['data'][year-1960]) >= 0.9 * (_this.svg_width * 0.95))
	  	  		return "end";
	  	  	else "start";
	  	  })
	  	  .attr("x", function(d) {
	  	  	if (_this.xscale(d['data'][year-1960]) >= 0.9 * (_this.svg_width * 0.95))
	  	  		return _this.xscale(d['data'][year - 1960]) - 10;
	  	  	else return Math.min(0.85 * _this.svg_width, _this.xscale(d['data'][year - 1960]) + 0.01 * _this.svg_width);
	  	  })
	  	  .attr("y", function(d) {return _this.yscale(d['country']) + _this.yscale.bandwidth()/2; })
	  	  .text(function(d){
	  	  	if (!isNaN(d['data'][year-1960]))
	  	  		return d['data'][year-1960].toFixed(2); 
			else return "";
	  	  })
	  	  .attr("alignment-baseline", "ideographic")
	  	  .style("font-size", function() {
	  	  	if (_this.input_data.length >= 10) {
		  		return 10;
		  	}
		  	else return 14;
	  	  })
	  	  .style("fill", function (d) {
	  	  	if (_this.xscale(d['data'][year-1960]) >= 0.9 * (_this.svg_width * 0.95))
	  	  		return "#ffffff";
	  	  	else return "#000000";
	  	  });
	}

	delete_plot() {
		d3.select("#subsvg-barChart").remove();
	}
}


/*
function makeBarChart(input_data, year_array) {

	d3.select("#subsvg-barChart").remove();

	var svg_width = $(".div-barChart").width();
	var svg_height = $(".div-barChart").height();
	
	var subsvg = svg_barChart.append("svg")
	  .attr("id", "subsvg-barChart")
	  .attr("width", "100%")
	  .attr("height", "100%");

	var slider = d3.select(".slider")
	  .on("onchange", val => updateBar(val));

	var color = d3.scaleOrdinal(d3.schemeCategory10)
	 
	updateBar(1960);

	function updateBar(year) {
		d3.selectAll(".xaxis").remove();
		d3.selectAll(".yaxis").remove();
		d3.select(".x-label").remove();
		//d3.selectAll(".bar").remove();
		d3.selectAll(".bar-label").remove();

		// sort the data
		input_data.sort(function(x1, x2) {
			var n1 = x1['data'][year-1960];
			var n2 = x2['data'][year-1960];
			if (isNaN(n1)) return 1;
			else if (isNaN(n2)) return -1;
			return n2 - n1;
		});

		var yscaleKey = [];
		for (var i = 0; i < input_data.length; i++)
			yscaleKey.push(input_data[i]['country']);

		var yscale = d3.scaleBand()
		  .domain(yscaleKey)
	  	  .range([0, svg_height*0.6])
	      .padding(0.1);

		subsvg.append("g")
	  	  .attr("class", "yaxis")
	  	  .attr("transform", "translate(" + (svg_width*0.1) + "," + 0.05 * svg_height + ")")
	  	  .call(d3.axisLeft(yscale));

		var xmin = Infinity, xmax = 0;
		for (var i = 0; i < input_data.length; i++) {
			if (!isNaN(input_data[i]['data'][year-1960])){
				xmin = Math.min(xmin, input_data[i]['data'][year-1960]);
				xmax = Math.max(xmax, input_data[i]['data'][year-1960]);
			}
		}

		var xscale = d3.scaleLinear()
	  	  .domain([0, xmax])
	  	  .range([svg_width * 0.1 , svg_width * 0.9]).nice()

	  	subsvg.append("g")
	  	  .attr("class", "xaxis")
	  	  .attr("transform", "translate(0," + (0.65 * svg_height) + ")")
	  	  .call(d3.axisBottom(xscale).tickFormat(d3.format(".2s")));

	  	subsvg.append("text")
	  	  .attr("class", "x-label")
		  .attr("x", 1.38 * svg_width)
		  .attr("y", svg_height)
		  .style("text-anchor", "start")
		  .text(d3.select("#subtopicSelect option:checked").text());
		
		var bars = subsvg
		  .selectAll(".bar")
		  .data(input_data);
		bars.exit().remove();
		bars.enter().append("rect")
		  .attr("class", "bar")
		  .attr("x", svg_width*0.1)
		  .merge(bars).transition().duration(500)
		  .attr("y", function (d) {return yscale(d['country']) + 0.05 * svg_height;})
	  	  .attr("fill", function(d, i) {return color(d['country']); })
	  	  .attr("width", function(d) {
	  	  	var data = d['data'][year-1960]; 
	  	  	if (isNaN(d['data'][year-1960]))
	  	  		return 0;
	  	  	else
	  	  		return xscale(d['data'][year-1960]); })
	  	  .attr("height", yscale.bandwidth());
		
	  	// TODELETE
	  	subsvg.selectAll(".bar")
	  	  .data(input_data).enter()
	  	  .append("rect")
	  	  .attr("class", "bar")
	  	  .attr("x", svg_width*0.1)
	  	  .attr("y", 0)
	  	  .attr("transform", function (d) {return "translate(0," + (yscale(d['country']) + 0.05 * svg_height) + ")"})
	  	  .attr("width", function(d) {
	  	  	var data = d['data'][year-1960]; 
	  	  	if (isNaN(d['data'][year-1960]))
	  	  		return 0
	  	  	else
	  	  		return xscale(d['data'][year-1960]); })
	  	  .attr("height", yscale.bandwidth())
	  	  .attr("fill", function(d, i) {return color(d['country']); });
		

	  	subsvg.selectAll(".bar-label")
	  	  .exit().remove()
	  	  .data(input_data).enter()
	  	  .append("text")
	  	  .attr("class", "bar-label")
	  	  .attr("text-anchor", "start")
	  	  .attr("x", function(d) {return xscale(d['data'][year - 1960]) + 0.11 * svg_width; })
	  	  .attr("y", function(d) {return yscale(d['country']) + yscale.bandwidth()/2 + 0.05 * svg_height; })
	  	  .text(function(d){
	  	  	if (!isNaN(d['data'][year-1960]))
	  	  		return d['data'][year-1960].toFixed(2); 
			else return "";
	  	  })
	  	  .attr("alignment-baseline", "ideographic")
	}
}
*/
