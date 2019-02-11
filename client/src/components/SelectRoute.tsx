import {FormControl, InputLabel, MenuItem, Select, withStyles} from "@material-ui/core";
import * as React from "react";

const styles = (theme: any) => ({
  root: {
    display: 'wrap' as "-moz-initial" | "inherit" | "initial" | "revert" | "unset" | "nowrap" | "wrap" | "wrap-reverse" | undefined,
    flexWrap: 'wrap'as "-moz-initial" | "inherit" | "initial" | "revert" | "unset" | "nowrap" | "wrap" | "wrap-reverse" | undefined,
  },
  formControl: {
    margin: theme.spacing.unit,
    minWidth: 120,
  },
  selectEmpty: {
    marginTop: theme.spacing.unit * 2,
  },
});

class PureSelectRoute extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
    this.state = {
      route: '',
      menuItems: [],
    };
  }

  componentDidMount() {
    // Call the backend and load all available routes here.
    fetch('http://localhost:5000/all_route_ids')
      .then(response => {
        response.json().then(routeIds => {
          console.log(routeIds);
          // Construct menu items array
          var items = [];
          for (var i in routeIds){
               items.push(
                  <MenuItem key={i} value={i}>{routeIds[i]}</MenuItem>
                 );
              }
          this.setState({menuItems: items})           
          }
        )
      })
  };

  handleChange = (event: any) => {
    this.setState({ [event.target.name]: event.target.value });
  };

  public render() {
    const { classes } = this.props;
    return (
      <form className={classes.root} autoComplete="off">
        <FormControl className={classes.formControl}>
          <InputLabel htmlFor="age-simple">Route</InputLabel>
          <Select
            value={this.state.route}
            onChange={this.handleChange}
            inputProps={{
              name: 'route',
              id: 'age-simple',
            }}
          >
            <MenuItem value="">
              <em>None</em>
            </MenuItem>
            {this.state.menuItems}
          </Select>
        </FormControl>
      </form>
    )
  }
}

export const SelectRoute = withStyles(styles)(PureSelectRoute);