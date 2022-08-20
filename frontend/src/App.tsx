import React from 'react'
import CurrentItems, { CurrentItemsProps } from './CurrentItems';
import Navigation, { NavigationProps, CombinedNavigationProps } from './Navigation';
import './App.css';
import { GlobalProps } from './GlobalProps';
import History, { HistoryProps } from './History';

interface AppProps extends GlobalProps {}

interface AppState {
  navigation: NavigationProps;
}

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps){
    super(props);
    this.onSelectedViewChange = this.onSelectedViewChange.bind(this);
    this.onSelectedModeChange = this.onSelectedModeChange.bind(this);
  }

  componentDidMount(){
    this.setState({
      navigation: {
        selectedView: "Common", // eventually switch these to api call
        views: ["Common", "Bathroom", "Empty", "Error"],
        onSelectedViewChange: this.onSelectedViewChange,
        selectedMode: "Current",
        modes: ["Current", "History"],
        onSelectedModeChange: this.onSelectedModeChange,
      }
    });
  }

  onSelectedViewChange(view: string) {
    if(this.state.navigation.selectedView === view){
      return;
    }

    let newNavObj = {...this.state.navigation};
    newNavObj.selectedView = view;
    this.setState({
      navigation: newNavObj
    });
  }

  onSelectedModeChange(mode: string){
    if(this.state.navigation.selectedMode === mode){
      return;
    }

    let newNavObj = {...this.state.navigation};
    newNavObj.selectedMode = mode;
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
      let historyProps = {
        global: this.props.global,
        selectedView: this.state.navigation.selectedView
      } as HistoryProps;
      
      return (
        <div>
          <Navigation {...navigationProps} />
          {this.state.navigation.selectedMode === "Current" &&
            <CurrentItems {...currentItemsProps} />
          }
          {this.state.navigation.selectedMode === "History" &&
            <History {...historyProps } />
          }
        </div>
      );
    }
  }
}

export default App;
