from flask import Flask
import requests
import os
from dotenv import load_dotenv
import pprint



app = Flask(__name__)

# The API endpoint
url = "https://jsonplaceholder.typicode.com/posts/1"


# get ship data 
@app.route('/')
def root():
    
    # load api key
    load_dotenv()
    api_key = os.getenv('SEAROUTES_API_KEY')

    url = "https://api.searoutes.com/vessel/v2/trace"

    # Vessel information (either imo or mmsi must be provided)
    imo = 9245756
    departureDateTime = "2023-02-16T15:00:00Z"
    arrivalDateTime = "2023-02-16T16:00:00Z"

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
        print(pprint.pprint(data))
        # print(json.dumps(data))
        # print(data)
    else:
        # Error handling
        print(f"Error: {response.status_code}")
        print(response.text)

    return "a"

# get ship data 
@app.route('/ship')
def get_ship_data():
    return "Hello, World!"

# get map data
@app.route('/map')
def get_map_data():
    return "Hello, World!"

if __name__ == '__main__':
    app.run(debug=True)
