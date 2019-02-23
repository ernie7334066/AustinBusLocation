import * as React from "react";
import { Header } from "./Header";
import { BusStop, BusRouteShapes, BusVehicle, Map } from "./Map";
import { SelectRouteForm } from "./SelectRouteForm";

interface PageState {
  route?: number;
  busRoute: {
    busStops: BusStop[];
    busRouteShapes: BusRouteShapes[];
  };
  busVehicles: BusVehicle[];
}

export class Page extends React.Component<any, PageState> {
  constructor(props: any) {
    super(props);
    this.state = {
      busRoute: {
        busStops: [],
        busRouteShapes: []
      },
      busVehicles: [],
      route: undefined
    };
  }

  public setRoute = (route: number): void => {
    this.setState({ route });
    this.loadRouteData(route);
  };

  public loadRouteData = (routeID?: number): void => {
    if (routeID) {
      // tslint:disable-next-line:no-console
      console.log(`Load route data for: ${routeID}`);
      fetch(`http://localhost:5000/bus_stops/${routeID}`)
        .then(response => {
          response.json().then(body => {
            console.log(body);
            this.setState({ busRoute: body });
          });
        })
        .then(() => {
          fetch(`http://localhost:5000/bus_locations/${routeID}`).then(
            response => {
              response.json().then(body => {
                console.log(body);
                this.setState({
                  busVehicles: body.map((vehicle: any) => vehicle.vehicle)
                });
              });
            }
          );
        });
    }
  };

  public render() {
    return (
      <React.Fragment>
        <Header />
        <SelectRouteForm onSubmit={this.setRoute} />
        <Map
          route={this.state.route}
          busRoute={this.state.busRoute}
          busVehicles={this.state.busVehicles}
        />
      </React.Fragment>
    );
  }
}
