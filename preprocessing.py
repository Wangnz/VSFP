import csv
import os

root = 'dataset'
countryDict = dict()
 

ROI = [
		'NY.GDP.MKTP.CD', 'NY.GDP.PCAP.CD', 'NY.GNP.PCAP.CD', 
		'EN.ATM.CO2E.KT', 'EN.CO2.TRAN.ZS', 'EN.CO2.MANF.ZS', 'EN.CO2.ETOT.ZS', 'EN.CO2.BLDG.ZS', 'EG.USE.COMM.CL.ZS',
		'SP.POP.TOTL', 'SP.DYN.CBRT.IN', 'SP.DYN.CDRT.IN', 'SM.POP.TOTL', 'SP.POP.GROW', 'SP.DYN.LE00.IN', 
		#'NY.ADJ.AEDU.CD', 'SE.XPD.TOTL.GD.ZS', 'SE.TER.CUAT.BA.ZS', 'SL.TLF.ADVN.ZS', 'SL.TLF.BASC.MA.ZS',
		'SE.PRE.ENRR', 'SE.PRM.NENR', 'SE.SEC.ENRR', 'SE.TER.ENRR', 'SE.XPD.TOTL.GD.ZS'
	]

ROI_set = set(ROI)

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

		with open('clean_dataset/{}/{}'.format(subfolder, file), 'w') as outfile:
			headers = ['year'] + ROI
			csv_writer = csv.DictWriter(outfile, fieldnames = headers)
			csv_writer.writeheader()
			
			for i in range(59):
				tmp_dict = dict()
				for k in countryDict.keys():
					tmp_dict[k] = countryDict[k][i]
				csv_writer.writerow(tmp_dict)
