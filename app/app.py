from flask import Flask, render_template, request, jsonify
import pandas as pd
import numpy as np
import os
import json

app = Flask(__name__, template_folder='../templates', static_folder='../static')

@app.route('/', methods=['POST', 'GET'])
def index():
	countryDict = load_data()

	return render_template('index.html', data = {'data': json.dumps(countryDict)})

def load_data():
	root = '../clean_dataset'

	countryDict = dict()

	for subfolder in os.listdir(root):
		
		if subfolder == '..' or subfolder == '.' or subfolder == ".DS_Store":
			continue
		
		full_subfolder_path = os.path.join(root, subfolder)

		if subfolder not in countryDict:
			countryDict[subfolder] = dict()

		for fn in os.listdir(full_subfolder_path):

			if fn == '..' or fn == '.' or fn == ".DS_Store":
				continue

			country_indicator = fn.split('_', 3)[1]
			df = pd.read_csv(os.path.join(full_subfolder_path, fn))
			countryDict[subfolder][country_indicator] = df.to_dict()

			features = countryDict[subfolder][country_indicator].keys()
			for k in features:
				countryDict[subfolder][country_indicator][k] = [v for _, v in countryDict[subfolder][country_indicator][k].items()]

	return countryDict

if __name__ == '__main__':
	app.run(debug=True)