import csv
import os

root = 'dataset'
countryDict = dict()

'''
	Economy:
		NY.GDP.PCAP.CD: GDP per capita
		NY.GDP.MKTP.CD: GDP
		NY.GNP.MKTP.CD: GNI

	Population:
		SP.POP.TOTL: total population number
		SP.DYN.CBRT.IN: birth rate
		SP.DYN.LE00.IN: life expectancy
		SM.POP.TOTL: international migrant
		SP.DYN.CDRT.IN: death rate
	Energy:
		EN.ATM.CO2E.KT: CO2 emission
		EN.CO2.TRAN.ZS: CO2 from transport
		EN.CO2.MANF.ZS: CO2 from manufacturing
		EN.CO2.ETOT.ZS: CO2 from electricity and heat production
		EN.CO2.BLDG.ZS: CO2 from residental and commercial buildings
		EG.USE.COMM.CL.ZS: alternative energy %
	Employment:
		SL.TLF.CACT.NE.ZS: labor force participation rate
		SL.UEM.TOTL.NE.ZS: Unemployment %
	Edu:
		NY.ADJ.AEDU.CD: education expenditure (US$)
		SE.XPD.TOTL.GD.ZS: Govenment expenditure on education
		SE.TER.CUAT.BA.ZS: education attainment (at lease Bachelor) %
		SL.TLF.ADVN.ZS: labor force with advanced education (%)
		SL.TLF.BASC.MA.ZS: labor force with basic education (%)
	
Expenditure on secondary education (% of government expenditure on education)	

'''
ROI_economy =  ['NY.GDP.MKTP.CD', 'NY.GDP.PCAP.CD', 'NY.GNP.PCAP.CD']
ROI_pop = ['SP.POP.TOTL', 'SP.DYN.CBRT.IN', 'SP.DYN.CDRT.IN', 'SM.POP.TOTL', 'SP.POP.GROW']
ROI_energy = ['EN.ATM.CO2E.KT', 'EN.CO2.TRAN.ZS', 'EN.CO2.MANF.ZS', 'EN.CO2.ETOT.ZS', 'EN.CO2.BLDG.ZS', 'EG.USE.COMM.CL.ZS']
ROI_edu = ['NY.ADJ.AEDU.CD', 'SE.XPD.TOTL.GD.ZS', 'SE.TER.CUAT.BA.ZS', 'SL.TLF.ADVN.ZS', 'SL.TLF.BASC.MA.ZS']

'''
ROI = [
		'NY.GDP.PCAP.CD', 'NY.GNP.PCAP.CD', 
		'EN.ATM.CO2E.KT', 'EN.ATM.NOXE.KT.CE', 'EG.USE.COMM.CL.ZS',
		'SP.POP.TOTL', 'SP.DYN.CBRT.IN', 'SP.DYN.CDRT.IN', 'SM.POP.TOTL', 'SP.POP.GROW',
		'SP.DYN.LE00.IN', 
		'SL.UEM.TOTL.NE.ZS', 'SL.TLF.CACT.NE.ZS'
	]
'''

ROI_target = ROI_energy
ROI_set = set(ROI_target)

for subfolder in os.listdir(root):
	if subfolder == '..' or subfolder == '.' or subfolder == ".DS_Store":
		continue

	subfolder_full_path = os.path.join(root, subfolder)
	
	for file in os.listdir(subfolder_full_path):

		pull_path = os.path.join(subfolder_full_path, file)
		
		with open(pull_path) as csv_file:
			csv_reader = csv.reader(csv_file, delimiter = ',')

			skip_line = 4
			for i in range(skip_line):
				next(csv_reader)

			header = next(csv_reader)
			'''
				['Country Name', 'Country Code', 'Indicator Name', 'Indicator Code', 
				'1960', ..., '2018', '']
				header[0] = Country Nmae
				header[2] = Indicator Name
				header[3] = Indicator Code
				header[4] ~ header[62] = years
			'''

			countryDict = dict()
			countryDict['year'] = [int(header[i]) for i in range(4, 63)]

			for row in csv_reader:
				if row[3] in ROI_set:
					dataList = []
					for i in range(4, 63):
						dataList.append(row[i] if row[i] else None)
					countryDict[row[3]] = dataList

			'''
			for k in countryDict.keys():
				print (k, sum([1 for elem in countryDict[k] if elem]))
			'''

		file_prefix = file.split('_')[1]
		filename = file_prefix + '_energy.csv'
		with open('clean_dataset/{}/{}'.format(subfolder, filename), 'w') as outfile:
			headers = ['year'] + ROI_target
			csv_writer = csv.DictWriter(outfile, fieldnames = headers)
			csv_writer.writeheader()
			
			for i in range(59):
				tmp_dict = dict()
				for k in countryDict.keys():
					tmp_dict[k] = countryDict[k][i]
				csv_writer.writerow(tmp_dict)

