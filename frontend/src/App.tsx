import React from 'react'
import CurrentItems, { CurrentItemsProps } from './CurrentItems';
import Navigation, { NavigationProps } from './Navigation';
import './App.css';
import { GlobalProps } from './GlobalProps';

interface AppProps extends GlobalProps {}

interface AppState {
  navigation: NavigationProps;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps){
    super(props);
  }

  componentDidMount(){
    this.setState({
      navigation: {
        selectedView: "Common", // eventually switch these to api call
        views: ["Common, Bathroom, Empty"],
        onSelectedViewChange: this.onSelectedViewChange,
        global: this.props.global
      }
    });
  }

  onSelectedViewChange(view: string) {}

  render(){
    let currentItemsProps = {
      global: this.globalProps,
      selectedView: this.state.navigation.selectedView
    } as CurrentItemsProps;
    
    return (
      <div>
        <Navigation props={this.state.navigation} />
        <CurrentItems {...currentItemsProps} />
      </div>
    );
  }
}

export default App;
