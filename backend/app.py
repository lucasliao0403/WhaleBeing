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
        # imo = 9648714
        departureDateTime = "2025-01-01T21:32:44Z"
        arrivalDateTime = "2025-01-11T21:32:44Z"

        params = {
            "imo": imo,
            # "mmsi": mmsi,  # uncomment if using mmsi instead of imo
            "departureDateTime": departureDateTime,
            "arrivalDateTime": arrivalDateTime,
            # "departure": departure,  # uncomment if using unix timestamp for departure
            # "arrival": arrival,  # uncomment if using unix timestamp for arrival
        }   
        headers = {"accept": "application/json", "x-api-key": api_key}
        response = requests.get(url, params=params, headers=headers)

        if response.status_code == 200:
            # Successful request
            data = response.json()
            # print(params)
            return data
        else:
            # Error handling
            print(f"Error: {response.status_code}")
            # print(response.text)
            return "Error: " + str(response.status_code) + " " + response.text
    except:
        return "Error: Invalid Input."

        
# get map data
@app.route('/map')
def get_map_data():
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True)
