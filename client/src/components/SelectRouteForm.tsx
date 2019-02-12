import {
  Button,
  FormControl,
  FormGroup,
  InputLabel,
  MenuItem,
  Select,
  withStyles
} from "@material-ui/core";
import * as React from "react";

const styles = (theme: any) => ({
  root: {
    display: "wrap" as
      | "-moz-initial"
      | "inherit"
      | "initial"
      | "revert"
      | "unset"
      | "nowrap"
      | "wrap"
      | "wrap-reverse"
      | undefined,
    flexWrap: "wrap" as
      | "-moz-initial"
      | "inherit"
      | "initial"
      | "revert"
      | "unset"
      | "nowrap"
      | "wrap"
      | "wrap-reverse"
      | undefined
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2
  }
});

interface PureSelectRouteState {
  route: string;
  menuItems: JSX.Element[];
}

interface PureSelectRouteProps {
  classes: any;
  onSubmit(route: string): void;
}

class PureSelectRoute extends React.Component<
  PureSelectRouteProps,
  PureSelectRouteState
> {
  constructor(props: any) {
    super(props);
    this.state = {
      route: "",
      menuItems: []
    };
  }

  public componentDidMount() {
    // Call the backend and load all available routes here.
    fetch("http://localhost:5000/all_route_ids").then(response => {
      response.json().then(routeIds => {
        // console.log(routeIds);
        // Construct menu items array
        const items = [];
        for (const i in routeIds) {
          if (i) {
            items.push(
              <MenuItem key={i} value={routeIds[i]}>
                {routeIds[i]}
              </MenuItem>
            );
          }
        }

        this.setState({ menuItems: items });
      });
    });
  }

  public handleRouteChange = (event: { target: { value: string } }) => {
    this.setState({ route: event.target.value });
  };

  public render() {
    const { classes } = this.props;
    return (
      <FormGroup className={classes.root} row={true}>
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="route-select">Route</InputLabel>
          <Select
            value={this.state.route}
            onChange={this.handleRouteChange}
            inputProps={{
              name: "route",
              id: "route-select"
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {this.state.menuItems}
          </Select>
        </FormControl>
        <Button
          variant="contained"
          color="primary"
          onClick={() => this.props.onSubmit(this.state.route)}
        >
          Find
        </Button>
      </FormGroup>
    );
  }
}

export const SelectRouteForm = withStyles(styles)(PureSelectRoute);
