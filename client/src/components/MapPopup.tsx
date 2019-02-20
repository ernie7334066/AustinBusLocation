import Moment from "moment";
import * as React from "react";
import { BusVehicle } from "./Map";
interface MapPopupProps {
  busVehicle: BusVehicle;
}

export const MapPopup: React.FunctionComponent<MapPopupProps> = (
  props: MapPopupProps
) => {
  return (
    <React.Fragment>
      <h3>License ID: {props.busVehicle.vehicle.license_plate}</h3>
      Stop: {props.busVehicle.stop_id}
      <p> Update: {Moment.unix(props.busVehicle.timestamp).format("LT")} </p>
    </React.Fragment>
  );
};
