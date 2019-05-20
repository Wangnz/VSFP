class PieChart {
	constructor () {
		this.svg_width = $(".div-barChart-pieChart").width();
		this.svg_height = $(".div-barChart-pieChart").height();

		this.input_data = null;
		this.xscale = null;
		this.yscale = null;
		this.color = d3.scaleOrdinal(d3.schemeCategory10);

		this.initial_setting();
	}

	update_data (input_data) {
		this.input_data = input_data;
	}

	initial_setting () {
		this.radius = Math.min(this.svg_height, this.svg_width) * 0.4;
		this.arc = d3.arc().outerRadius(this.radius*0.8).innerRadius(this.radius * 0.6);
		this.labelArc = d3.arc().outerRadius(this.radius * 0.9).innerRadius(this.radius * 0.9);
	}

	make_plot (cur_year) {
		d3.select("#subsvg-pieChart").remove();
		var subsvg = svg_barChart_pieChart.append("svg")
	  	  .attr("id", "subsvg-pieChart")
	  	  .attr("width", "100%")
	  	  .attr("height", "100%");

	  	this.updatePie(cur_year);
	}

	updatePie (year) {
		d3.select(".pie").remove();

		var subsvg = d3.select("#subsvg-pieChart");
		var _this = this;

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
		  .attr("transform", "translate(" + (this.svg_width / 2) + "," + (this.svg_height * 0.4) + ")");

		var slice = pieFrame.selectAll(".slice")
		  .data(pie(this.input_data)).enter()
		  .append("g")
		  .attr("class", "slice");

		slice.append("path")
		  .attr("d", this.arc)
		  .attr("fill", function(d, i) {return _this.color(i); });

		var total = 0;
		for (var i = 0; i < this.input_data.length; i++) {
			if (!isNaN(this.input_data[i]['data'][year - 1960]))
				total += this.input_data[i]['data'][year - 1960];
		}
		
		slice.append("text")
		  .filter(function(d) {console.log(d.startAngle, d.endAngle); return (d.endAngle - d.startAngle) * 180 / Math.PI >= 10; })
		  .attr("transform", function(d, i) {
		  	var pos = _this.labelArc.centroid(d);
		  	pos[0] = _this.radius * 0.95 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1);
		  	pos[0] += d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 10 : 40;
		  	pos[0] -= i * 10;
		  	return "translate(" + (pos) + ")";
		  })
		  .attr("dy", "0.35em")
		  .style("text-anchor", function(d) {return (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? "start" : "end"); })
		  .text(function(d) {
		  	if (!isNaN(d.data['data'][year-1960]))
		  		return d.data['country'] + " (" + (d.data['data'][year-1960] *100 / total).toFixed(1) + "%)";
		  })
		  .style("font-size", 12);

		var lineFrame = pieFrame.append("g")
		  .attr("class", "lines");

		var polyLine = lineFrame.selectAll("polyline")
		  .data(pie(this.input_data)).enter()
		  .filter(function(d) {console.log(d.startAngle, d.endAngle); return (d.endAngle - d.startAngle) * 180 / Math.PI >= 10; })
		  .append("polyline")
		  .attr("points", function(d, i) {
		  		if (d.value == 0) return [0, 0];
		  		if (d.startAngle != 0 || d.endAngle != 0){
			  		var pos = _this.labelArc.centroid(d);
			  		pos[0] = _this.radius * 0.95 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1);
			  		pos[0] += d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 10 : 40;
			  		pos[0] -= i * 10;
			  		return [_this.arc.centroid(d), _this.labelArc.centroid(d), pos];
			  	}
		  })
		  .attr("fill", "none")
		  .attr("stroke", "black")
		  .attr("stroke-width", "1px")
		  .attr("opacity", ".6");
	}

	delete_plot() {
		d3.select("#subsvg-pieChart").remove();
	}
}

/*
function makePieChart(input_data, year_array) {

	d3.select("#subsvg-barChart").remove();

	var svg_width = $(".div-barChart").width();
	var svg_height = $(".div-barChart").height();
	
	var subsvg = svg_barChart.append("svg")
	  .attr("id", "subsvg-barChart")
	  .attr("width", "100%")
	  .attr("height", "100%");

	var slider = d3.sliderBottom()
	  .min(1960).max(2018)
	  .width(svg_width * 0.8)
	  .step(1)
	  .default(1960)
	  .on("onchange", val => updatePie(val));

	var gSlider = subsvg.append("g")
	  .attr("class", "slider")
	  .attr("transform", "translate(" + (0.1 * svg_width) + "," + (0.8 * svg_height) + ")");
	gSlider.call(slider);

	var color = d3.scaleOrdinal(d3.schemeCategory10)
	
	var radius = Math.min(svg_height, svg_width) * 0.4;
	
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
		  .attr("transform", "translate(" + (svg_width / 2) + "," + (svg_height * 0.4) + ")");

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
		  	pos[0] -= i * 10;
		  	return "translate(" + (pos) + ")";
		  })
		  .attr("dy", "0.35em")
		  .style("text-anchor", function(d) {return (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? "start" : "end"); })
		  .text(function(d) {
		  	if (!isNaN(d.data['data'][year-1960]))
		  		return d.data['country'] + " (" + (d.data['data'][year-1960] *100 / total).toFixed(1) + "%)";
		  });

		var lineFrame = pieFrame.append("g")
		  .attr("class", "lines");

		var polyLine = lineFrame.selectAll("polyline")
		  .data(pie(input_data)).enter()
		  .append("polyline")
		  .attr("points", function(d, i) {
		  		if (d.value == 0) return [0, 0];
		  		if (d.startAngle != 0 || d.endAngle != 0){
			  		var pos = labelArc.centroid(d);
			  		pos[0] = radius * 0.95 * (d.startAngle + (d.endAngle - d.startAngle) / 2 < Math.PI ? 1 : -1) + 30;
			  		pos[0] -= i * 10;
			  		return [arc.centroid(d), labelArc.centroid(d), pos];
			  	}
		  })
		  .attr("fill", "none")
		  .attr("stroke", "black")
		  .attr("stroke-width", "1px")
		  .attr("opacity", ".6");

	}
}
*/