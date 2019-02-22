import mapboxgl, { GeoJSONSource, Map as MapBoxMap, Marker } from "mapbox-gl";
import * as React from "react";
import ReactDOMServer from "react-dom/server";
import { MapPopup } from "./MapPopup";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

interface MapProps {
  route?: number;
  busStops: BusStop[];
  busVehicles: BusVehicle[];
}

export interface BusStop {
  lat: number;
  lng: number;
  stop_id: string;
  tripID: string;
}

export interface BusVehicle {
  timestamp: number;
  stop_id: number;
  position: {
    latitude: number;
    longitude: number;
    speed: number;
    bearing: number;
  };
  vehicle: { license_plate: string; id: string };
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

// const coordinates: Coordinate[lng, lat] = [
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
      this.props.busVehicles !== prevProps.busVehicles
    ) {
      if (
        this.state.map &&
        this.state.map.isStyleLoaded() &&
        this.props.busStops.length !== 0
      ) {
        this.renderBusRoute();
        this.renderBusVehicles();
        console.log(this.props.busVehicles);
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

  private renderBusVehicles = () => {
    this.updateBusVehicleCoordinatesAndInfo(this.props.busVehicles);
  };

  private addMarker = (coordinate: Coordinate): Marker | undefined => {
    const { map } = this.state;
    if (map) {
      return new mapboxgl.Marker().setLngLat(coordinate).addTo(map);
    }
  };

  private addBusMarker = (
    coordinate: Coordinate,
    busVehicle: BusVehicle
  ): Marker | undefined => {
    const { map } = this.state;
    if (map) {
      const bearing_str = this.readBearing(busVehicle.position.bearing);
      const el: HTMLElementTagNameMap["div"] = document.createElement("div");
      el.className = "BusMarker_" + bearing_str;
      return new mapboxgl.Marker(el)
        .setLngLat(coordinate)
        .setPopup(
          new mapboxgl.Popup({ offset: 25 }).setHTML(
            ReactDOMServer.renderToStaticMarkup(
              <MapPopup busVehicle={busVehicle} />
            )
          )
        )
        .addTo(map);
    }
  };

  private readBearing = (bearing: number) => {
    var bearing_str: string = "N";
    const binHalfWidth: number = 45 / 2;
    if (bearing >= 360 - binHalfWidth || bearing < 0 + binHalfWidth) {
      bearing_str = "N";
    }
    const bearing_list: string[] = ["NE", "E", "SE", "S", "SW", "W", "NW"];
    for (var i = 0; i < bearing_list.length; i++) {
      if (
        bearing >= 45 * (i + 1) - binHalfWidth &&
        bearing < 45 * (i + 1) + binHalfWidth
      ) {
        bearing_str = bearing_list[i];
      }
    }
    return bearing_str;
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

  private updateBusVehicleCoordinatesAndInfo = (vehicles: BusVehicle[]) => {
    const { map } = this.state;
    if (map) {
      // Remove all markers and add new bus location
      this.state.BusMarkers.map(marker => {
        marker.remove();
      });

      const BusMarkers: Marker[] = [];
      vehicles.map((vehicle, index) => {
        const marker = this.addBusMarker(
          [vehicle.position.longitude, vehicle.position.latitude],
          vehicle
        );
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
