import folium
import requests
import time

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
#m.save('map.html')
route_id = 803
filteredTripID = [veh['vehicle']['trip']['trip_id'] for veh in vehs if
                      int(veh['vehicle']['trip']['route_id']) == route_id]

# import stop location
#tripID = "2104620"
filtered_stop_id_all = {}
filtered_stop_sequence_all = {}
with open("capmetro/stop_times.txt") as f:
    for line in f:
        (trip_id,arrival_time,departure_time,
         stop_id,stop_sequence,stop_headsign,
         pickup_type,drop_off_type,
         shape_dist_traveled,timepoint) = line.split(",")
        if trip_id in filteredTripID:
            if trip_id in filtered_stop_id_all:
                filtered_stop_id_all[trip_id].append(stop_id)
                filtered_stop_sequence_all[trip_id].append(int(stop_sequence))
            else:
                filtered_stop_id_all[trip_id]=[stop_id]
                filtered_stop_sequence_all[trip_id]=[int(stop_sequence)]
                           

# Remove repeated sequence of stop IDs
filtered_stop_id = filtered_stop_id_all[filteredTripID[0]]
filtered_stop_sequence = filtered_stop_sequence_all[filteredTripID[0]]
for tripID in filteredTripID:
    if filtered_stop_id_all[tripID] != filtered_stop_id:
        filtered_stop_id2 = filtered_stop_id_all[tripID]
        filtered_stop_sequence2 = filtered_stop_sequence_all[tripID]
    
filtered_stop_lat = [[None]*len(filtered_stop_id),[None]*len(filtered_stop_id2)]
filtered_stop_long = [[None]*len(filtered_stop_id),[None]*len(filtered_stop_id2)]
with open("capmetro/stops.txt") as f:
    for line in f:
        (stop_id,stop_code,stop_name,stop_desc,
         stop_lat,stop_lon,zone_id,stop_url,
         location_type,parent_station,stop_timezone,
         wheelchair_boarding,corner_placement,stop_position,
         on_street,at_street,heading) = line.split(",")
        if stop_id in filtered_stop_id:
            idx = filtered_stop_id.index(stop_id)
            filtered_stop_lat[0][idx]=float(stop_lat)
            filtered_stop_long[0][idx]=float(stop_lon)
        if stop_id in filtered_stop_id2:
            idx = filtered_stop_id2.index(stop_id)
            filtered_stop_lat[1][idx]=float(stop_lat)
            filtered_stop_long[1][idx]=float(stop_lon)            

current_time = int(time.time())