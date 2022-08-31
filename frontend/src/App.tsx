import React from 'react'
import Alert from 'react-bootstrap/Alert';
import CurrentItems, { CurrentItemsProps } from './CurrentItems';
import Navigation, { NavigationProps, CombinedNavigationProps } from './Navigation';
import './App.css';
import { GlobalProps } from './GlobalProps';
import History, { HistoryProps } from './History';

interface AppProps {
  baseUrl: string,
  port: number;
}
interface AppState {
  navigation?: NavigationProps;
  errorMsg?: string;
  errorTimeout?: NodeJS.Timeout;
  lastMarkedId?: number;
  undoTimeout?: NodeJS.Timeout;
  headerText?: JSX.Element;
  appInitialized: boolean;
}

const timeoutMilliseconds = 5000;

class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps){
    super(props);
    this.onSelectedViewChange = this.onSelectedViewChange.bind(this);
    this.onSelectedModeChange = this.onSelectedModeChange.bind(this);
    this.dismissErrorAlert = this.dismissErrorAlert.bind(this);
    this.showErrorAlert = this.showErrorAlert.bind(this);
    this.changeHeaderText = this.changeHeaderText.bind(this);

    this.state = {
      appInitialized: false
    };
  }

  dismissErrorAlert(){
    if(this.state.errorTimeout){
        clearTimeout(this.state.errorTimeout);
    }

    this.setState({
        errorMsg: undefined,
        errorTimeout: undefined
    });
  }
  showErrorAlert(msg: string){
      if (this.state.errorTimeout){
          clearTimeout(this.state.errorTimeout);
      }

      let timeout = setTimeout(this.dismissErrorAlert, timeoutMilliseconds);
      this.setState({
          errorMsg: msg,
          errorTimeout: timeout
      });
  }

  onSelectedViewChange(view: string) {
    if(this.state.navigation === undefined || this.state.navigation.selectedView === view){
      return;
    }

    let newNavObj = {...this.state.navigation};
    newNavObj.selectedView = view;
    this.setState({
      navigation: newNavObj
    });
  }

  onSelectedModeChange(mode: string){
    if(this.state.navigation === undefined || this.state.navigation.selectedMode === mode){
      return;
    }

    let newNavObj = {...this.state.navigation};
    newNavObj.selectedMode = mode;
    newNavObj.headerText = undefined;

    if(mode === "edit"){
      newNavObj.selectedView = undefined;
    } else if (newNavObj.selectedView === undefined){
      newNavObj.selectedView = newNavObj.defaultView;
    }

    this.setState({
      navigation: newNavObj
    });
  }

  changeHeaderText(text?: JSX.Element){
    if(this.state.navigation === undefined){
      return;
    }

    let newNavObj = {...this.state.navigation};
    newNavObj.headerText = text;
    this.setState({
      navigation: newNavObj
    });
  }

  fetchViews(): any {
    const viewsPath = "/views";
    let url = this.props.baseUrl + ":" + this.props.port + viewsPath;

    fetch(url, { "method": "GET" }).then( resp => {
      if(!resp.ok){
        console.log(`Error ${resp.status} fetching views: ${resp.statusText}`);
        this.showErrorAlert("Error fetching views.");
        return;
      }

      return resp.json();
    }).then(data => {
      console.log("fetch views data", data);
      if(data === undefined){
        return;
      }

      let navObj = {
        onSelectedModeChange: this.onSelectedModeChange,
        onSelectedViewChange: this.onSelectedViewChange,
        selectedMode: "Current",
        modes: ["Current", "History"],
        views: []
      } as NavigationProps;
  
      if(data !== undefined) {
        navObj.views = data.views;
        navObj.selectedView = data.defaultView;
        navObj.defaultView = data.defaultView;
      }
  
      this.setState({
        navigation: navObj,
        appInitialized: true
      });
    }).catch(err => {
      console.log(`Error fetching views: ${err}`);
      this.showErrorAlert("Error fetching views.");
    });

    console.log("foo");
  }

  componentDidMount(){
    console.log("app did mount", this.state.appInitialized);
    this.fetchViews();
  }

  render(){
    if(this.state === undefined || !this.state.appInitialized || this.state.navigation === undefined){
      return (<div>Loading...</div>);
    } else {
      console.log("rendering??");
      let globalProps = {
        global: {
          baseUrl: this.props.baseUrl,
          port: this.props.port,
          showErrorAlert: this.showErrorAlert,
          changeHeaderText: this.changeHeaderText
        }
      } as GlobalProps;
      let currentItemsProps = {
        global: globalProps.global,
        selectedView: this.state.navigation.selectedView
      } as CurrentItemsProps;
      let navigationProps = {...this.state.navigation, global: globalProps.global} as CombinedNavigationProps;
      let historyProps = {
        global: globalProps.global,
        selectedView: this.state.navigation.selectedView
      } as HistoryProps;
      
      return (
        <div>
          <Navigation {...navigationProps} />
          <div className={ "content-container " + (this.state.errorMsg !== undefined ? "err" : "")}>
            {this.state.navigation.selectedMode === "Current" &&
              <CurrentItems {...currentItemsProps} />
            }
            {this.state.navigation.selectedMode === "History" &&
              <History {...historyProps } />
            }
          </div>
          <div className="footer">
            <Alert variant="danger" dismissible transition={false}
                show={this.state.errorMsg !== undefined}
                onClose={this.dismissErrorAlert}>
                <span>{this.state.errorMsg}</span>
            </Alert>
          </div>
          <div id="footerSpacer"></div>
        </div>
      );
    }
  }
}

export default App;
