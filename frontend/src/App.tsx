import React from 'react'
import CurrentItems, { CurrentItemsProps } from './CurrentItems';
import Navigation, { NavigationProps } from './Navigation';
import { CombinedNavigationProps } from './Navigation';
import './App.css';
import { GlobalProps } from './GlobalProps';

interface AppProps extends GlobalProps {}

interface AppState {
  navigation: NavigationProps;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps){
    super(props);
    this.onSelectedViewChange = this.onSelectedViewChange.bind(this);
  }

  componentDidMount(){
    this.setState({
      navigation: {
        selectedView: "Common", // eventually switch these to api call
        views: ["Common", "Bathroom", "Empty"],
        onSelectedViewChange: this.onSelectedViewChange,
      }
    });
  }

  onSelectedViewChange(view: string) {
    if(this.state.navigation.selectedView === view){
      console.log("Selected view is current view, no change");
      return;
    }

    let newNavObj = {...this.state.navigation};
    newNavObj.selectedView = view;
    this.setState({
      navigation: newNavObj
    });
  }

  render(){
    if(this.state === undefined || this.state === null){
      return (<div>Loading...</div>);
    } else {
      let currentItemsProps = {
        global: this.props.global,
        selectedView: this.state.navigation.selectedView
      } as CurrentItemsProps;
      let navigationProps = {...this.state.navigation, global: this.props.global} as CombinedNavigationProps;
      
      return (
        <div>
          <Navigation {...navigationProps} />
          <CurrentItems {...currentItemsProps} />
        </div>
      );
    }
  }
}

export default App;
