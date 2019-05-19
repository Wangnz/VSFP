function getExtentWithNaN(array) {
	var min = Infinity, max = 0;

	for (var i = 0; i < array.length; i++) {
		if (!isNaN(array[i])) {
			min = Math.min(min, array[i]);
			max = Math.max(max, array[i]);
		}
	}

	return [min, max];
}

function encode2Name(encode) {
	switch (encode) {
		case "year":
			return "Year";

		// economy
		case "NY.GDP.PCAP.CD":
			return "GDP (USD per cap.)";
		case "NY.GNP.PCAP.CD":
			return "GNI (USD per cap.)";
		case "NY.GDP.MKTP.CD":
			return "GDP (US$)"

		// population
		case "SP.POP.TOTL":
			return "Population";
		case "SP.DYN.CBRT.IN":
			return "Birth Rate (%)";
		case "SP.DYN.LE00.IN":
			return "Life Expectancy (years)";
		case "SM.POP.TOTL":
			return "Migrant";
		case "SP.POP.GROW":
			return "Population growth (%)"
		case "SP.DYN.CDRT.IN":
			return "Death Rate (%)";
 
		// energy
		case "EN.ATM.CO2E.KT":
			return "CO2 Eemission (kt)";
		case "EN.CO2.TRAN.ZS":
			return "CO2 (transportation) (%)";
		case "EN.CO2.MANF.ZS":
			return "CO2 (manufacturing ind.) (%)";
		case "EN.CO2.ETOT.ZS":
			return "CO2 (power production) (%)";
		case "EN.CO2.BLDG.ZS":
			return "CO2 (commercial bldg.)"
		case "EG.USE.COMM.CL.ZS":
			return "Alter. Energy (%)";

		// edu
		case "SE.PRE.ENRR":
			return "Enrollment (preprimary) (%)";
		case "SE.PRM.NENR":
			return "Enrollment (primary) (%)";
		case "SE.SEC.ENRR":
			return "Enrollment (secondary) (%)";
		case "SE.TER.ENRR":
			return "Enrollment (tertiary) (%)";
		case "SE.XPD.TOTL.GD.ZS":
			return "Gov. expenditure (% of GDP)";
	}
}