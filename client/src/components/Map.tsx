import mapboxgl, { GeoJSONSource, Map as MapBoxMap, Marker } from "mapbox-gl";
import * as React from "react";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

interface MapProps {
  route?: number;
  busStops: BusStop[];
}

export interface BusStop {
  lat: number;
  lng: number;
  stop_id: string;
}

interface MapState {
  zoom: number;
  // map is an instance of https://docs.mapbox.com/mapbox-gl-js/api/#map
  map?: MapBoxMap;
  markers: Marker[];
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
      markers: []
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
    // TODO: adjust height based on screen size.
    return (
      <div
        id="map"
        className="absolute top right left bottom"
        style={{ height: 800, width: "100%" }}
      />
    );
  }

  private renderBusRoute = () => {
    const busStops: Coordinate[] = this.props.busStops.map(busStop => {
      return [busStop.lng, busStop.lat] as Coordinate;
    });

    this.updateBusStopCoordinates(busStops);
  };

  private addMarker = (coordinate: Coordinate): Marker | undefined => {
    const { map } = this.state;
    if (map) {
      return new mapboxgl.Marker().setLngLat(coordinate).addTo(map);
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
      this.state.markers.map(marker => {
        marker.remove();
      });

      const markers: Marker[] = [];
      coordinates.map(coordinate => {
        const marker = this.addMarker(coordinate);
        if (marker) {
          markers.push(marker);
        }
      });
      this.setState({
        markers
      });
    }
  };
}
