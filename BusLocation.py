import folium
import requests


# Create map object
m = folium.Map(location=[30.26,-97.74], zoom_start=12)

tooltip = 'Click for more info'

# Obtain real-time bus data
r = requests.get('https://data.texas.gov/download/cuc7-ywmd/text%2Fplain')
d = r.json()
vehs = d['entity']

for veh in vehs:
    lat = veh['vehicle']['position']['latitude']
    long = veh['vehicle']['position']['longitude']
    routeID = veh['vehicle']['trip']['route_id']
    # create marker
    folium.Marker([lat,long],
                  popup='<strong>Route '+routeID+'</strong>',
                  tooltip=tooltip,
                  icon=folium.Icon(icon='bus',prefix='fa')).add_to(m)
# Generate map
m.save('map.html')

# import stop location
tripID = "2104620"
filtered_stop_id = []
with open("capmetro/stop_times.txt") as f:
    for line in f:
        (trip_id,arrival_time,departure_time,
         stop_id,stop_sequence,stop_headsign,
         pickup_type,drop_off_type,
         shape_dist_traveled,timepoint) = line.split(",")
        if trip_id==tripID:
            filtered_stop_id.append(stop_id)
            
filtered_stop_lat = []
filtered_stop_long = []
with open("capmetro/stops.txt") as f:
    for line in f:
        (stop_id,stop_code,stop_name,stop_desc,
         stop_lat,stop_lon,zone_id,stop_url,
         location_type,parent_station,stop_timezone,
         wheelchair_boarding,corner_placement,stop_position,
         on_street,at_street,heading) = line.split(",")
        if stop_id in filtered_stop_id:
            filtered_stop_lat.append(float(stop_lat))
            filtered_stop_long.append(float(stop_lon))