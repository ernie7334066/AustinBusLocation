import mapboxgl from "mapbox-gl";
import * as React from "react";

mapboxgl.accessToken = process.env.REACT_APP_MAPBOX_ACCESS_TOKEN || "";

const addMarker = (lng: number, lat: number, map: any) => {
  new mapboxgl.Marker().setLngLat([lng, lat]).addTo(map);
};

interface MapProps {
  route?: number;
}

export class Map extends React.Component<MapProps, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      lng: -97.7431,
      lat: 30.2672,
      zoom: 11.5,
      map: null
    };
  }

  public componentDidMount() {
    const { lng, lat, zoom } = this.state;

    this.setState(
      {
        map: new mapboxgl.Map({
          container: "map",
          style: "mapbox://styles/mapbox/streets-v9",
          center: [lng, lat],
          zoom
        })
      },
      () => {
        const { map } = this.state;
        addMarker(lng, lat, map);

        map.on("move", () => {
          this.setState({
            lng: lng.toFixed(4),
            lat: lat.toFixed(4),
            zoom: map.getZoom().toFixed(2)
          });
        });
      }
    );
  }

  // TODO: fill this function.
  public loadRouteData = (routeID?: number): void => {
    if (routeID) {
      // tslint:disable-next-line:no-console
      console.log(`Load route data for: ${this.props.route}`);
    }
  };

  public render() {
    const { lng, lat, zoom } = this.state;
    this.loadRouteData(this.props.route);

    // TODO: render the route based on data received from backend.
    // tslint:disable-next-line:no-console
    console.log(`Display route for: ${this.props.route}`);

    // TODO: adjust height based on screen size.
    return (
      <div>
        <div className="inline-block absolute top left mt12 ml12 bg-darken75 color-white z1 py6 px12 round-full txt-s txt-bold">
          <div>{`Longitude: ${lng} Latitude: ${lat} Zoom: ${zoom}`}</div>
        </div>
        <div
          id="map"
          className="absolute top right left bottom"
          style={{ height: 800, width: "100%" }}
        />
      </div>
    );
  }
}
