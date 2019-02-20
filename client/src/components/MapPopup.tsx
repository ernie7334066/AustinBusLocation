import * as React from "react";

interface MapPopupProps {
  timelapse: number;
}

export const MapPopup: React.FunctionComponent<MapPopupProps> = (
  props: MapPopupProps
) => {
  return (
    <React.Fragment>
      <h3>Last update</h3>
      <p>{props.timelapse} sec ago </p>
    </React.Fragment>
  );
};
