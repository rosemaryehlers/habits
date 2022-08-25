import React from 'react'
import Alert from 'react-bootstrap/Alert';
import CurrentItems, { CurrentItemsProps } from './CurrentItems';
import Navigation, { NavigationProps, CombinedNavigationProps } from './Navigation';
import './App.css';
import { GlobalProps } from './GlobalProps';
import History, { HistoryProps } from './History';
import { Container } from 'react-bootstrap';

interface AppProps {
  baseUrl: string,
  port: number;
}
interface AppState {
  navigation: NavigationProps;
  errorMsg?: string;
  errorTimeout?: NodeJS.Timeout;
  lastMarkedId?: number;
  undoTimeout?: NodeJS.Timeout;
  headerText?: JSX.Element;
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
    newNavObj.headerText = undefined;
    this.setState({
      navigation: newNavObj
    });
  }

  changeHeaderText(text?: JSX.Element){
    let newNavObj = {...this.state.navigation};
    newNavObj.headerText = text;
    this.setState({
      navigation: newNavObj
    });
  }

  render(){
    if(this.state === undefined || this.state === null){
      return (<div>Loading...</div>);
    } else {
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
