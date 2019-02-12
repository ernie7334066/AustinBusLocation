import mapboxgl, { Map as MapBoxMap } from "mapbox-gl";
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
  lng: number;
  lat: number;
  zoom: number;
  // map is an instance of https://docs.mapbox.com/mapbox-gl-js/api/#map
  map?: MapBoxMap;
}

const defaultCenter: Coordinate = [-97.7431, 30.2672];
export declare type Coordinate = [number, number];

export class Map extends React.Component<MapProps, MapState> {
  constructor(props: MapProps) {
    super(props);
    this.state = {
      lng: defaultCenter[0],
      lat: defaultCenter[1],
      zoom: 11.5,
      map: undefined
    };
  }

  public componentDidMount() {
    const { lng, lat, zoom } = this.state;

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
        this.addMarker([lng, lat]);
      }
    );
  }

  public render() {
    // TODO: render the route based on data received from backend.
    // tslint:disable-next-line:no-console
    // console.log(`Display route for: ${this.props.route}`);
    if (
      this.state.map &&
      this.state.map.isStyleLoaded() &&
      this.props.busStops.length !== 0
    ) {
      this.renderBusRoute();
    }

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

    this.drawLines(busStops);
  };

  private addMarker = (coordinate: Coordinate) => {
    const { map } = this.state;
    if (map) {
      new mapboxgl.Marker().setLngLat(coordinate).addTo(map);
    }
  };

  private drawLines = (coordinates: Coordinate[]) => {
    // const coordinates: Coordinate[] = [
    //   [-97.7431, 30.2672],
    //   [-97.7531, 30.2772],
    // ];
    const { map } = this.state;
    if (map) {
      map.addLayer({
        id: "route",
        type: "line",
        source: {
          type: "geojson",
          data: {
            type: "Feature",
            properties: {},
            geometry: {
              type: "LineString",
              coordinates: coordinates
            }
          }
        },
        layout: {
          "line-join": "round",
          "line-cap": "round"
        },
        paint: {
          "line-color": "#888",
          "line-width": 8
        }
      });
    }
  };
}
