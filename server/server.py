from flask import *
import os
import requests
import json

app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello World"


@app.route("/all_routes")
def all_routes():
    return []


@app.route("/bus_locations/<int:route_id>")
def bus_locations(route_id):
    r = requests.get('https://data.texas.gov/download/cuc7-ywmd/text%2Fplain')
    d = r.json()
    vehs = d['entity']
    filteredVehs = [veh for veh in vehs if int(veh['vehicle']['trip']['route_id']) == route_id]

    # for veh in vehs:
    #     lat = veh['vehicle']['position']['latitude']
    #     long = veh['vehicle']['position']['longitude']
    #     routeID = veh['vehicle']['trip']['route_id']
    return json.dumps(filteredVehs)


if __name__ == '__main__':
    # https://stackoverflow.com/questions/17260338/deploying-flask-with-heroku
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
