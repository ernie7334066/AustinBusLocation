from flask import Flask
import os
import requests
import json
import time
from flask_cors import CORS, cross_origin

app = Flask(__name__)


@app.route("/")
def hello():
    return "Hello World"


@app.route("/all_route_ids")
@cross_origin()
def all_routes():
    """ Returns all bus route IDs """
    all_routes = []
    with open("../capmetro/routes.txt") as f:
        next(f)  # Skip the first line
        for line in f:
            (route_id, agency_id, route_short_name, route_long_name, route_desc, route_type, route_url, route_color,
             route_text_color) = line.split(",")
            all_routes.append(route_id)
    return json.dumps(all_routes)


@app.route("/bus_stops/<int:route_id>")
def bus_stops(route_id):
    """ Given a bus route id, returns all the bus stops' positions. """
    r = requests.get('https://data.texas.gov/download/cuc7-ywmd/text%2Fplain')
    d = r.json()
    vehs = d['entity']
    # query stop ID using trip ID
    filteredTripID = [veh['vehicle']['trip']['trip_id'] for veh in vehs if
                      int(veh['vehicle']['trip']['route_id']) == route_id]
    filtered_stop_id = []
    with open("../capmetro/stop_times.txt") as f:
        for line in f:
            (trip_id, arrival_time, departure_time,
             stop_id, stop_sequence, stop_headsign,
             pickup_type, drop_off_type,
             shape_dist_traveled, timepoint) = line.split(",")
            if trip_id in filteredTripID:
                filtered_stop_id.append(stop_id)
    # query stop coordinates using stop ID
    filtered_stop_position = []
    with open("../capmetro/stops.txt") as f:
        for line in f:
            (stop_id, stop_code, stop_name, stop_desc,
             stop_lat, stop_lon, zone_id, stop_url,
             location_type, parent_station, stop_timezone,
             wheelchair_boarding, corner_placement, stop_position,
             on_street, at_street, heading) = line.split(",")
            if stop_id in filtered_stop_id:
                filtered_stop_position.append({'stop_id': stop_id, 'lat': float(stop_lat), 'lng': float(stop_lon)})
    return json.dumps(filtered_stop_position)


@app.route("/bus_locations/<int:route_id>")
def bus_locations(route_id):
    """ Returns the position of a certain bus route. """
    r = requests.get('https://data.texas.gov/download/cuc7-ywmd/text%2Fplain')
    d = r.json()
    vehs = d['entity']
    filteredVehs = [veh for veh in vehs if int(veh['vehicle']['trip']['route_id']) == route_id]
    CurrentTime = int(time.time())
    for veh in filteredVehs:
        veh['vehicle']['timelapse'] = CurrentTime - veh['vehicle']['timestamp']
    return json.dumps(filteredVehs)


if __name__ == '__main__':
    # https://stackoverflow.com/questions/17260338/deploying-flask-with-heroku
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
