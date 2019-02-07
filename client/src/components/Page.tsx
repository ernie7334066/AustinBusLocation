import * as React from "react";
import { Map } from "./Map";
import {Header} from "./Header";
import {SelectRoute} from "./SelectRoute";

export class Page extends React.Component<any> {
  public render() {
    return (
      <React.Fragment>
        <Header/>
        <SelectRoute/>
        <Map />
      </React.Fragment>
    );
  }
}