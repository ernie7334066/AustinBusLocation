from flask import Flask
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
    
    # query stop ID using trip ID
    filteredTripID = [veh['vehicle']['trip']['trip_id'] for veh in vehs if int(veh['vehicle']['trip']['route_id']) == route_id]
    filtered_stop_id = []
    with open("../capmetro/stop_times.txt") as f:
        for line in f:
            (trip_id,arrival_time,departure_time,
             stop_id,stop_sequence,stop_headsign,
             pickup_type,drop_off_type,
             shape_dist_traveled,timepoint) = line.split(",")
            if trip_id in filteredTripID:
                filtered_stop_id.append(stop_id)
    # query stop coordinates using stop ID            
    filtered_stop_lat = []
    filtered_stop_long = []
    with open("../capmetro/stops.txt") as f:
        for line in f:
            (stop_id,stop_code,stop_name,stop_desc,
             stop_lat,stop_lon,zone_id,stop_url,
             location_type,parent_station,stop_timezone,
             wheelchair_boarding,corner_placement,stop_position,
             on_street,at_street,heading) = line.split(",")
            if stop_id in filtered_stop_id:
                filtered_stop_lat.append(float(stop_lat))
                filtered_stop_long.append(float(stop_lon))
    return json.dumps([filteredVehs,filtered_stop_lat,filtered_stop_long])


if __name__ == '__main__':
    # https://stackoverflow.com/questions/17260338/deploying-flask-with-heroku
    # Bind to PORT if defined, otherwise default to 5000.
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)

