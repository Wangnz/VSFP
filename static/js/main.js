console.log(data);

function keyMapping(topic) {
	/*
	Economy:
		NY.GDP.MKTP.CD: GDP
		NY.GNP.MKTP.CD: GNI

	Population:
		SP.POP.TOTL: total population number
		SP.DYN.CBRT.IN: birth rate
		SP.DYN.LE00.IN: life expectancy
		SM.POP.TOTL: international migrant
		SP.DYN.CDRT.IN: death rate
	Energy:
		EN.ATM.NOXE.KT.CE: NO2 emission
		EN.ATM.CO2E.KT: CO2 emission
		EG.USE.COMM.CL.ZS: alternative energy %
	Employment:
		SL.TLF.CACT.NE.ZS: labor force participation rate
		SL.UEM.TOTL.NE.ZS: Unemployment %

	*/
	if (topic == "economy") {
		return {
		"gdp": "NY.GDP.PCAP.CD",
		"gdp_per_capita": "'NY.GDP.MKTP.CD",
		"gni": "NY.GNP.PCAP.CD"};
	}
	else if (topic == "population") {
		return {"population": "SP.POP.TOTL", "birth_rate": "SP.DYN.CBRT.IN", "life_expectancy": "SP.DYN.LE00.IN", "migrant": "SM.POP.TOTL", "death_rate": "SP.DYN.CDRT.IN", "SP.POP.GROW": "population_growth"}
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
	/*
	else if (topic == "employment") {
		return {"lfpr": "SL.TLF.CACT.NE.ZS", "unemployment": "SL.UEM.TOTL.NE.ZS"}
	} */
	else if (topic == "education") {
		return {
			"edu_expend": "NY.ADJ.AEDU.CD",
			"edu_bachelor": "SE.TER.CUAT.BA.ZS",
			"labor_force_advanced": "SL.TLF.ADVN.ZS",
			"labor_force_basic": "SL.TLF.BASC.MA.ZS"
		}
	}
}

function showPlot (line_chart, par_coor_plot) {

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
		else if (topic == "education") subtopic = "edu_expend";
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
		if (income == "high-income") country_par = "USA";
		else if (income == "middle-income") country_par = "TUR";
		else if (income == "low-income") country_par = "SOM";
		updatePlot(topic, subtopic, income, status);
	})

	$(".plotType").on("click", function() {
		var type = $(this).val();
		if (type == "Line Chart") {
			status = 1;
		}
		else if (type == "Bar Chart") {
			status = 2;
		}
		else if (type == "Pie Chart") {
			status = 3;
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
		for (var country in data[income])
			array.push({'country': country, 'data': data[income][country][key[subtopic]]});

		switch (status) {
			case 1:
				line_chart.update_data(array, year_array);
				line_chart.make_plot();
				// makeLineChart(array, year_array);
				break;
			case 2:
				makeBarChart(array, year_array);
				break;
			case 3:
				makePieChart(array, year_array);
				break;
		}
		updateParColPlot(income, country_par, topic);
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
		/*
		else if (feature_topic == 'employment') {
			features += [];
		}
		*/
		else if (feature_topic == 'education') {
			features = features.concat(["NY.ADJ.AEDU.CD", "SE.XPD.TOTL.GD.ZS", "SE.TER.CUAT.BA.ZS", "SL.TLF.ADVN.ZS", "SL.TLF.BASC.MA.ZS"]);
		}
		par_coor_plot.update_data(data[income], income, country, features);
		par_coor_plot.make_plot();
		// makeParCoorPlot(data[income], income, country, features);
	}
}



var margin = {top:50, right: 50, bottom: 100, left: 50};
var WIDTH = 1000 - margin.left - margin.right;
var HEIGHT = 500 - margin.top - margin.bottom;

var svgContainer = d3.select("#div1").attr("class", "svg-container");
var svg = svgContainer.append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 0 " + WIDTH + " " + (HEIGHT+100))
  .attr("class", "svg-content-responsive")
  .attr("id", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");

var svgContainer2 = d3.select("#div2").attr("class", "svg-container");
var svg2 = svgContainer2.append("svg")
  .attr("preserveAspectRatio", "xMinYMin meet")
  .attr("viewBox", "0 -10" + " " + WIDTH + " " + (HEIGHT+50))
  .attr("class", "svg-content-responsive")
  .attr("width", "100%")
  .attr("height", "100%");


let par_coor_plot = new ParCoorPlot();
let line_chart = new LineChart();
par_coor_plot.link_to_lineChart(line_chart);
line_chart.link_to_parCoorPlot(par_coor_plot);
showPlot(line_chart, par_coor_plot);