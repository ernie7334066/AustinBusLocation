import * as React from 'react';
import './App.css';
import {Page} from "./components/Page";

export class App extends React.Component<any, any> {
  constructor(props: any) {
    super(props);
  }

  render() {
    return (
      <Page />
    );
  }
}


