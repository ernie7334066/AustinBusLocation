import * as React from "react";
import Moment from "moment";
interface MapPopupProps {
  timestamp: number;
}

export const MapPopup: React.FunctionComponent<MapPopupProps> = (
  props: MapPopupProps
) => {
  return (
    <React.Fragment>
      <h3>Last update</h3>
      <p> {Moment.unix(props.timestamp).format("LT")} </p>
    </React.Fragment>
  );
};
