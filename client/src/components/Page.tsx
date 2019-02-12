import * as React from "react";
import { Header } from "./Header";
import { Map } from "./Map";
import { SelectRouteForm } from "./SelectRouteForm";

interface PageState {
  route?: number;
}

export class Page extends React.Component<any, PageState> {
  constructor(props: any) {
    super(props);
    this.state = {
      route: undefined
    };
  }

  public setRoute = (route: number): void => {
    this.setState({ route });
  };

  public render() {
    return (
      <React.Fragment>
        <Header />
        <SelectRouteForm onSubmit={this.setRoute} />
        <Map route={this.state.route} />
      </React.Fragment>
    );
  }
}
