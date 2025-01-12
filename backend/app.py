from flask import Flask
from flask import request
import requests
import os
from dotenv import load_dotenv
import pprint
from flask_cors import CORS

app = Flask(__name__)
CORS(app)

# The API endpoint
url = "https://jsonplaceholder.typicode.com/posts/1"

# get ship data 
@app.route('/ship-data')
def root():
    # load api key
    load_dotenv()
    api_key = os.getenv('SEAROUTES_API_KEY')
    try:
        imo = request.args.get('imo')
        url = "https://api.searoutes.com/vessel/v2/trace"

        # Vessel information (either imo or mmsi must be provided)
        departureDateTime = request.args.get('start_date') + "Z"
        arrivalDateTime = request.args.get('end_date') + "Z"

        print(departureDateTime)
        print(arrivalDateTime)
        print(imo)

        params = {
            "imo": imo,
            # "mmsi": mmsi,  # uncomment if using mmsi instead of imo
            "departureDateTime": departureDateTime,
            "arrivalDateTime": arrivalDateTime,
        }   
        headers = {"accept": "application/json", "x-api-key": api_key}
        response = requests.get(url, params=params, headers=headers)

        if response.status_code == 200:
            # Successful request
            data = response.json()
            print(data)
            # print(params)
            return data
        else:
            # Error handling
            pprint(vars(response))
            print(response.status_code)
            # print(f"Error: {response.status_code.error_code}")
            # print(response.text)
            return "Error: " + str(response.status_code) + " " + response.text
    except:
        # pprint(vars(response))
        return "Error: Invalid Input."

        
# get map data
@app.route('/map')
def get_map_data():
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True)
