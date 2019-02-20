import mapboxgl, { GeoJSONSource, Map as MapBoxMap, Marker } from "mapbox-gl";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
import { MapPopup } from "./MapPopup";

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
  vehicle: {
    timestamp: number;
    position: { latitude: number; longitude: number; speed: number };
  };
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
      BusMarkers: []
    };
  }

  public componentDidUpdate(prevProps: MapProps, prevState: MapState) {
    if (
      this.props.busStops !== prevProps.busStops ||
      this.props.busLoc !== prevProps.busLoc
    ) {
      if (
        this.state.map &&
        this.state.map.isStyleLoaded() &&
        this.props.busStops.length !== 0
      ) {
        this.renderBusRoute();
        this.renderBusLoc();
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
    const w = window;
    const d = document;
    const e = d.documentElement;
    const g = d.getElementsByTagName("body")[0];
    const heightValue = w.innerHeight || e.clientHeight || g.clientHeight;
    return (
      <div
        id="map"
        className="absolute top right left bottom"
        style={{ height: heightValue, width: "100%" }}
      />
    );
  }

  private renderBusRoute = () => {
    const busStops: Coordinate[] = this.props.busStops.map(busStop => {
      return [busStop.lng, busStop.lat] as Coordinate;
    });

    this.updateBusStopCoordinates(busStops);
  };

  private renderBusLoc = () => {
    const timestamp: number[] = this.props.busLoc.map(busLoc => {
      return busLoc.vehicle.timestamp;
    });
    const busLoc: Coordinate[] = this.props.busLoc.map(busLoc => {
      return [
        busLoc.vehicle.position.longitude,
        busLoc.vehicle.position.latitude
      ] as Coordinate;
    });

    this.updateBusLocCoordinates(busLoc, timestamp);
  };

  private addMarker = (coordinate: Coordinate): Marker | undefined => {
    const { map } = this.state;
    if (map) {
      return new mapboxgl.Marker().setLngLat(coordinate).addTo(map);
    }
  };

  private addBusMarker = (
    coordinate: Coordinate,
    timestamp: number
  ): Marker | undefined => {
    const { map } = this.state;
    if (map) {
      const el: HTMLElementTagNameMap["div"] = document.createElement("div");
      el.className = "BusMarker";
      return new mapboxgl.Marker(el)
        .setLngLat(coordinate)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            ReactDOMServer.renderToStaticMarkup(
              <MapPopup timestamp={timestamp} />
            )
          )
        )
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

  private updateBusLocCoordinates = (
    coordinates: Coordinate[],
    timestamp: number[]
  ) => {
    const { map } = this.state;
    if (map) {
      // Remove all markers and add new bus location
      this.state.BusMarkers.map(marker => {
        marker.remove();
      });

      const BusMarkers: Marker[] = [];
      coordinates.map((coordinate, index) => {
        const marker = this.addBusMarker(coordinate, timestamp[index]);
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
