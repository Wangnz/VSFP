function keyMapping(topic) {
	if (topic == "economy") {
		return {
			"gdp_per_capita": "NY.GDP.PCAP.CD",
			"gdp": "NY.GDP.MKTP.CD",
			"gni": "NY.GNP.PCAP.CD"};
	}
	else if (topic == "population") {
		return {
			"population": "SP.POP.TOTL",
			"birth_rate": "SP.DYN.CBRT.IN",
			"life_expectancy": "SP.DYN.LE00.IN",
			"migrant": "SM.POP.TOTL",
			"death_rate": "SP.DYN.CDRT.IN",
			"population_growth": "SP.POP.GROW"}
	}
	else if (topic == "energy") {
		return {
			"co2_emission": "EN.ATM.CO2E.KT",
			"co2_tran": "EN.CO2.TRAN.ZS",
			"co2_manf": "EN.CO2.MANF.ZS",
			"co2_elec": "EN.CO2.ETOT.ZS",
			"co2_bldg": "EN.CO2.BLDG.ZS",
			"alternative": "EG.USE.COMM.CL.ZS"}
	}
	else if (topic == "education") {
		return {
			"gov_expenditure": "SE.XPD.TOTL.GD.ZS",
			"enroll_preprimary": "SE.PRE.ENRR",
			"enroll_primary": "SE.PRM.NENR",
			"enroll_secondary": "SE.SEC.ENRR",
			"enroll_tertiary": "SE.TER.ENRR"
		}
	}
}

function showPlot (line_chart, par_coor_plot, bar_chart, pie_chart, scatterPlot) {

	year_array = [];
	for (var i = 1960; i <= 2018; i++)
		year_array.push(i);

	var topic = document.getElementById("topicSelect").value;
	var subtopic = document.getElementById("subtopicSelect").value;
	var income = document.getElementById("incomeSelect").value;
	var status = 1;

	var country_par = document.getElementById("countrySelect").value;

	// register topic selection
	d3.select("#topicSelect").on("change", function() {
		topic = d3.select("#topicSelect").property("value");
		if (topic == "economy") subtopic = "gdp";
		else if (topic == "energy") subtopic = "co2_emission";
		else if (topic == "population") subtopic = "population";
		else if (topic == "education") subtopic = "gov_expenditure";
		updatePlot(topic, subtopic, income, status);
	});

	// register subtopic selection
	d3.select("#subtopicSelect").on("change", function() {
		subtopic =  d3.select("#subtopicSelect").property("value");
		updatePlot(topic, subtopic, income, status);
	});

	// register income selection
	d3.select("#incomeSelect").on("change", function() {
		income = d3.select("#incomeSelect").property("value");
		if (income == "high-income" || income == "all"){
			country_par = "USA";
		}
		else if (income == "middle-income"){
			country_par = "TUR";
		}
		else if (income == "low-income"){
			country_par = "SOM";
		}
		updatePlot(topic, subtopic, income, status);
	})

	// register the button for the bar chart/pie chart visualization
	$(".plotType").on("click", function() {
		var type = $(this).val();
		if (type == "Bar Chart") {
			status = 1;
		}
		else if (type == "Pie Chart") {
			status = 2;
		}
		$(".plotType").removeAttr("disabled");
		$(this).attr("disabled", true);

		updatePlot(topic, subtopic, income, status)
	});

	// register country selection in parallel coordinate plot
	d3.select("#countrySelect").on("change", function() {
		country_par = d3.select("#countrySelect").property("value");
		updateParColPlot(income, country_par, topic);
	})

	updatePlot(topic, subtopic, income, status);
	updateParColPlot(income, country_par, topic);

	function updatePlot(topic, subtopic, income, status) {
		var key = keyMapping(topic);
		var array = [];

		if (income == "all") {
			for (var incomeType in data) {
				for (var country in data[incomeType]) {
					array.push({'country': country, 'data': data[incomeType][country][key[subtopic]]});
				}
			}
		}
		else {
			for (var country in data[income])
				array.push({'country': country, 'data': data[income][country][key[subtopic]]});
		}

		// plot bar chart/pie chart
		var cur_year = slider.value();
		switch (status) {
			case 1:
				bar_chart.update_data(array);
				pie_chart.delete_plot();
				bar_chart.make_plot(cur_year);
				break;
			case 2:
				pie_chart.update_data(array);
				bar_chart.delete_plot();
				pie_chart.make_plot(cur_year);
				break;
		}

		// plot line chart
		line_chart.update_data(array, year_array);
		line_chart.make_plot();

		// plot parallel coordinate plot
		updateParColPlot(income, country_par, topic);

		// plot scatter plot
		var scatter_array = [];
		for (var incomeType in data) {
			for (var country in data[incomeType]) {
				scatter_array.push({
					'country': country,
					'radius': data[incomeType][country][keyMapping("economy")["gdp"]],
					'xaxis': data[incomeType][country][key[subtopic]],
					'yaxis': data[incomeType][country][keyMapping("economy")["gdp_per_capita"]]
				});
			}
		}
		scatterPlot.update_data(scatter_array);
		scatterPlot.make_plot(cur_year);
	}

	function updateParColPlot(income, country, feature_topic) {

		// TODO: input adds the topic: population (done), education, economy, employment, energy
		var features = ["year", "NY.GDP.PCAP.CD", ];
		if (feature_topic == 'economy') {
			features = features.concat(["NY.GNP.PCAP.CD"]);
		}
		else if (feature_topic == 'energy') {
			features = features.concat(["EN.ATM.CO2E.KT", "EN.CO2.TRAN.ZS", "EN.CO2.ETOT.ZS", "EN.CO2.MANF.ZS", "EN.CO2.BLDG.ZS", "EG.USE.COMM.CL.ZS"]);
		}
		else if (feature_topic == 'population') {
			features = features.concat(["SP.DYN.LE00.IN", "SP.POP.GROW", "SP.DYN.CBRT.IN", "SP.DYN.CDRT.IN"]);
		}
		else if (feature_topic == 'education') {
			features = features.concat(['SE.PRE.ENRR', 'SE.PRM.NENR', 'SE.SEC.ENRR', 'SE.TER.ENRR', 'SE.XPD.TOTL.GD.ZS']);
		}
		if (income == 'all') {
			merged_dict = {};
			for (var incomeType in data) {
				merged_dict = Object.assign({}, merged_dict, data[incomeType]);
			}
			par_coor_plot.update_data(merged_dict, income, country, features);	
		}
		else
			par_coor_plot.update_data(data[income], income, country, features);

		par_coor_plot.make_plot();
		// makeParCoorPlot(data[income], income, country, features);
	}
}

function updateData(year, barChart, pieChart, scatterPlot) {
	scatterPlot.updateScatter(year);
	if (document.getElementById("subsvg-barChart"))
		barChart.updateBar(year);
	else if (document.getElementById("subsvg-pieChart"))
		pieChart.updatePie(year);
}

var margin = {top:50, right: 50, bottom: 100, left: 50};
var WIDTH = document.documentElement.clientWidth / 2;// - margin.left - margin.right;
var HEIGHT = document.documentElement.clientHeight / 2 - margin.top - margin.bottom;

d3.select(".div-lineChart").attr("class", "div-lineChart svg-container");
var svgContainer_lineChart = d3.select(".div-lineChart-plot");
var svg_lineChart = svgContainer_lineChart.append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  //.attr("viewBox", "0 0 " + WIDTH + " " + (HEIGHT))
  .attr("class", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");

var svgContainer_parCoorPlot = d3.select(".div-parCoorPlot").attr("class", "div-parCoorPlot svg-container");
var svg_parCoorPlot = svgContainer_parCoorPlot.append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  //.attr("viewBox", "0 0" + " " + WIDTH + " " + (HEIGHT*2))
  .attr("class", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");

var svgContainer_barChart_pieChart = d3.select(".div-barChart-pieChart").attr("class", "div-barChart-pieChart svg-container");
var svg_barChart_pieChart = svgContainer_barChart_pieChart.append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
  //.attr("viewBox", "0 0" + " " + WIDTH + " " + (HEIGHT*2))
  .attr("class", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");

/*
var svgContainer_pieChart = d3.select(".div-barChart").attr("class", "div-pieChart svg-container");
var svg_pieChart = svgContainer_pieChart.append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
  //.attr("viewBox", "0 0" + " " + WIDTH + " " + (HEIGHT*2))
  .attr("class", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");
*/

var svgContainer_scatterPlot = d3.select(".div-scatterPlot").attr("class", "div-scatterPlot svg-container");
var svg_scatterPlot = svgContainer_scatterPlot.append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
  //.attr("viewBox", "0 0" + " " + WIDTH + " " + (HEIGHT*2))
  .attr("class", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");

var svgContainer_worldMap = d3.select(".div-worldMap").attr("class", "div-worldMap svg-container");
var svg_worldMap = svgContainer_worldMap.append("svg")
.attr("preserveAspectRatio", "xMinYMin meet")
  //.attr("viewBox", "0 0" + " " + WIDTH + " " + (HEIGHT*2))
  .attr("class", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");

// add the slider under the world map in div-worldMap
var svg_width = $(".div-worldMap").width();
var svg_height = $(".div-worldMap").height();

let par_coor_plot = new ParCoorPlot();
let line_chart = new LineChart();
let bar_chart = new BarChart();
let pie_chart = new PieChart();
let scatterPlot = new ScatterPlot();

par_coor_plot.link_to_lineChart(line_chart);
line_chart.link_to_parCoorPlot(par_coor_plot);

var slider = d3.sliderBottom()
  .min(1960).max(2018)
  .width(svg_width * 0.8)
  .step(1)
  .default(1960)
  .on("onchange", val => updateData(val, bar_chart, pie_chart, scatterPlot));

showPlot(line_chart, par_coor_plot, bar_chart, pie_chart, scatterPlot);

var gSlider = svg_worldMap.append("g")
  .attr("class", "slider")
  .attr("transform", "translate(" + (0.1 * svg_width) + "," + (0.8 * svg_height) + ")");

gSlider.call(slider);