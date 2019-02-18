import mapboxgl, { GeoJSONSource, Map as MapBoxMap, Marker } from "mapbox-gl";
import * as React from "react";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

interface MapProps {
  route?: number;
  busStops: BusStop[];
  busLoc: BusLoc[];
}

export interface BusStop {
  lat: number;
  lng: number;
  stop_id: string;
  trip_dir: number;
}

export interface BusLoc {
  vehicle: {timelapse: number;
            position: {latitude: number;
                       longitude: number;
                       speed: number}};
}

interface MapState {
  zoom: number;
  // map is an instance of https://docs.mapbox.com/mapbox-gl-js/api/#map
  map?: MapBoxMap;
  BusStopMarkers: Marker[];
  BusMarkers: Marker[];
}

const defaultCenter: Coordinate = [-97.7431, 30.2672];
const busStopsSourceID: string = "bus_stops";
const routeLayerID: string = "route";
const defaultBusStopMapBoxData: MapBoxData = {
  type: "Feature",
  geometry: {
    type: "LineString",
    coordinates: []
  },
  properties: {}
};

// const coordinates: Coordinate[] = [
//   [-97.7431, 30.2672],
//   [-97.7531, 30.2772],
// ];
export declare type Coordinate = [number, number];

declare type MapBoxData =
  | GeoJSON.Feature<GeoJSON.Geometry>
  | GeoJSON.FeatureCollection<GeoJSON.Geometry>;

export class Map extends React.Component<MapProps, MapState> {
  constructor(props: MapProps) {
    super(props);
    this.state = {
      zoom: 11.5,
      map: undefined,
      BusStopMarkers: [],
      BusMarkers: [],
    };
  }

  public componentDidUpdate(prevProps: MapProps, prevState: MapState) {
    if (this.props.busStops !== prevProps.busStops) {
      if (
        this.state.map &&
        this.state.map.isStyleLoaded() &&
        this.props.busStops.length !== 0
      ) {
        this.renderBusRoute();
        this.renderBusLoc();
        console.log(this.props.busLoc)
      }
    }
  }

  public componentDidMount() {
    const { zoom } = this.state;

    this.setState(
      {
        map: new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v9",
          center: defaultCenter,
          zoom
        })
      },
      () => {
        const { map } = this.state;
        if (map) {
          map.on("style.load", () => {
            map.addSource(busStopsSourceID, {
              type: "geojson",
              data: defaultBusStopMapBoxData
            });
            map.addLayer({
              id: routeLayerID,
              type: "line",
              source: busStopsSourceID,
              layout: {
                "line-join": "round",
                "line-cap": "round"
              },
              paint: {
                "line-color": "#888",
                "line-width": 8
              }
            });
          });
        }
      }
    );
  }

  public render() {
    var w = window,
    d = document,
    e = d.documentElement,
    g = d.getElementsByTagName('body')[0],
    height_value = w.innerHeight|| e.clientHeight|| g.clientHeight;
    return (
      <div
        id="map"
        className="absolute top right left bottom"
        style={{ height: height_value, width: "100%" }}
      />
    );
  }

  private renderBusRoute = () => {
    const busStops: Coordinate[] = this.props.busStops.map(busStops => {
      return [busStops.lng, busStops.lat] as Coordinate;
    });

    this.updateBusStopCoordinates(busStops);
  };
  
  private renderBusLoc = () => {
    const timelapse: number[] = this.props.busLoc.map(busLoc => {
      return busLoc.vehicle.timelapse
    });
    const busLoc: Coordinate[] = this.props.busLoc.map(busLoc => {
      return [busLoc.vehicle.position.longitude, busLoc.vehicle.position.latitude] as Coordinate;
    });

    this.updateBusLocCoordinates(busLoc,timelapse);
  };

  private addMarker = (coordinate: Coordinate): Marker | undefined => {
    const { map } = this.state;
    if (map) {
      return new mapboxgl.Marker().setLngLat(coordinate).addTo(map);
    }
  };

  private addBusMarker = (coordinate: Coordinate, timelapse: number): Marker | undefined => {
    const { map } = this.state;
    if (map) {
      var el = document.createElement('div');
      el.className = 'BusMarker';
      return new mapboxgl.Marker(el).setLngLat(coordinate)
      .setPopup(new mapboxgl.Popup({ offset: 25 })
      .setHTML('<h3>' + 'Last update' + '</h3><p>' + timelapse + ' sec ago </p>'))
      .addTo(map);
    }
  };

  private updateBusStopCoordinates = (coordinates: Coordinate[]) => {
    const { map } = this.state;
    if (map) {
      const source: GeoJSONSource = map.getSource(
        busStopsSourceID
      ) as GeoJSONSource;
      source.setData({
        ...defaultBusStopMapBoxData,
        ...{
          geometry: {
            type: "LineString",
            coordinates
          }
        }
      });

      // Remove all markers and add new bus stops
      this.state.BusStopMarkers.map(marker => {
        marker.remove();
      });

      const BusStopMarkers: Marker[] = [];
      coordinates.map(coordinate => {
        const marker = this.addMarker(coordinate);
        if (marker) {
          BusStopMarkers.push(marker);
        }
      });
      this.setState({
        BusStopMarkers
      });
    }
  };

  private updateBusLocCoordinates = (coordinates: Coordinate[], timelapses: number[]) => {
    const { map } = this.state;
    if (map) {
      // Remove all markers and add new bus location
      this.state.BusMarkers.map(marker => {
        marker.remove();
      });

      const BusMarkers: Marker[] = [];
      coordinates.map((coordinate,index) => {
        const marker = this.addBusMarker(coordinate,timelapses[index]);
        if (marker) {
          BusMarkers.push(marker);
        }
      });
      this.setState({
        BusMarkers
      });
    }
  };  
}
