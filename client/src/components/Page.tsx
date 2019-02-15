import * as React from "react";
import { Header } from "./Header";
import { BusStop, BusLoc, Map } from "./Map";
import { SelectRouteForm } from "./SelectRouteForm";

interface PageState {
  route?: number;
  busStops: BusStop[];
  busLoc: BusLoc[];
}

export class Page extends React.Component<any, PageState> {
  constructor(props: any) {
    super(props);
    this.state = {
      busStops: [],
      busLoc: [],
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
      fetch(`http://localhost:5000/bus_stops/${routeID}`).then(response => {
        response.json().then(body => {
          this.setState({ busStops: body });
        });
      });
      fetch(`http://localhost:5000/bus_locations/${routeID}`).then(response => {
        response.json().then(body => {
          this.setState({ busLoc: body });
        });
      });
    }
  };

  public render() {
    return (
      <React.Fragment>
        <Header />
        <SelectRouteForm onSubmit={this.setRoute} />
        <Map route={this.state.route} busStops={this.state.busStops} busLoc={this.state.busLoc}/>
      </React.Fragment>
    );
  }
}
