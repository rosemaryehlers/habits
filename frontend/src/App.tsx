import React, { useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap';
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
}
interface Error {
  msg: string,
  timeout: NodeJS.Timeout
}

const timeoutMilliseconds = 5000;

function App(props: AppProps){
    const [error, setError] = useState<Error>();
    const [navigation, setNavigation] = useState<NavigationProps>({
      views: [],
      modes: ["Current", "History"],
      selectedMode: "Current",
      onSelectedModeChange: onSelectedModeChange,
      onSelectedViewChange: onSelectedViewChange
    });

    // initialize app
    useEffect(() => {
        console.log("App useEffect");
        const viewsPath = "/views";
        let url = props.baseUrl + ":" + props.port + viewsPath;

        fetch(url, { "method": "GET" }).then( resp => {
            if(!resp.ok){
              console.log(`Error ${resp.status} fetching views: ${resp.statusText}`);
              showErrorAlert("Error fetching views.");
              return;
            }

            return resp.json();
        }).then(data => {
            if(data === undefined){
              return;
            }

            let newNavObj = {...navigation};
            newNavObj.views = data.views;
            newNavObj.selectedView = data.defaultView;
            newNavObj.defaultView = data.defaultView;
            setNavigation(newNavObj);
        }).catch(err => {
            console.log(`Error fetching views: ${err}`);
            showErrorAlert("Error fetching views.");
        });
    }, [props.baseUrl, props.port]);

    function dismissErrorAlert(){
        if(error !== undefined && error.timeout !== undefined){
            clearTimeout(error.timeout);
        }

        setError(undefined);
    }
    function showErrorAlert(msg: string){
        if (error !== undefined && error.timeout !== undefined){
            clearTimeout(error.timeout);
        }

        let timeout = setTimeout(dismissErrorAlert, timeoutMilliseconds);
        setError({
          msg: msg,
          timeout: timeout
        });
    }
    function onSelectedViewChange(view: string) {
      if(navigation.selectedView === view){
        return;
      }
  
      let newNavObj = {...navigation};
      console.log("onSelectedViewChange", navigation, newNavObj);
      newNavObj.selectedView = view;
      setNavigation(newNavObj);
    }
    function onSelectedModeChange(mode: string){
      if(navigation.selectedMode === mode){
        return;
      }
  
      let newNavObj = {...navigation};
      newNavObj.selectedMode = mode;
      newNavObj.headerText = undefined;
  
      if(mode === "edit"){
        newNavObj.selectedView = undefined;
      } else if (newNavObj.selectedView === undefined){
        newNavObj.selectedView = newNavObj.defaultView;
      }
  
      setNavigation(newNavObj);
    }
    function changeHeaderText(text?: JSX.Element){
      if(navigation.headerText === text){
        return;
      }
  
      let newNavObj = {...navigation};
      newNavObj.headerText = text;
      setNavigation(newNavObj);
    }

    let globalProps = {
      global: {
        baseUrl: props.baseUrl,
        port: props.port,
        showErrorAlert: showErrorAlert,
        changeHeaderText: changeHeaderText
      }
    } as GlobalProps;
    let currentItemsProps = {
      global: globalProps.global,
      selectedView: navigation.selectedView
    } as CurrentItemsProps;
    let navigationProps = {...navigation, global: globalProps.global} as CombinedNavigationProps;
    let historyProps = {
      global: globalProps.global,
      selectedView: navigation.selectedView
    } as HistoryProps;

    return (
        <div>
            <Navigation {...navigationProps} />
            <div className={ "content-container " + (error !== undefined ? "err" : "")}>
                { navigation.selectedMode === "Current" &&
                  <CurrentItems {...currentItemsProps} />
                }
                { navigation.selectedMode === "History" &&
                  <History {...historyProps } />
                }
                { navigation.selectedMode === "Edit" &&
                  <div>Edit mode!</div>
                }
            </div>
            <div className="footer">
                <Alert variant="danger" dismissible transition={false}
                    show={ error !== undefined }
                    onClose={ dismissErrorAlert }>
                    <span>{ error?.msg }</span>
                </Alert>
            </div>
            <div id="footerSpacer"></div>
        </div>
    );
}

export default App;
