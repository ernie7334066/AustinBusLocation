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