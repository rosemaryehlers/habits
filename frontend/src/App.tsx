import React, { useEffect, useState } from 'react'
import { Alert, Container } from 'react-bootstrap';
import CurrentItems, { CurrentItemsProps } from './CurrentItems';
import './App.css';
import { GlobalProps } from './GlobalProps';
import History, { HistoryProps } from './History';
import EditViews from './EditViews';
import { AppNavigationProps } from './AppNavigation';

interface AppProps {
  baseUrl: string,
  port: number;
}
interface Error {
  msg: string,
  timeout: NodeJS.Timeout
}

const timeoutMilliseconds = 5000;

function App(props: AppProps){
    const [error, setError] = useState<Error>();
    const [views, setViews] = useState<Array<string>>([]);
    const modes = ["Current", "History"];
    const [selectedMode, setSelectedMode] = useState("Current");
    const [selectedView, setSelectedView] = useState<string | undefined>();
    const [defaultView, setDefaultView] = useState<string | undefined>();
    const [headerText, setHeaderText] = useState<JSX.Element | undefined>();

    // initialize app
    useEffect(() => {
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

            setViews(data.views);
            setDefaultView(data.defaultView);
            setSelectedView(data.defaultView);
        }).catch(err => {
            console.log(`Error fetching views: ${err}`);
            showErrorAlert("Error fetching views.");
        });
    }, [props.baseUrl, props.port]);

    function onViewChange(newView: string) {
      setSelectedView(newView);
    }
    function onModeChange(newMode: string) {
      setSelectedMode(newMode);
    }

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

    let globalProps = {
      global: {
        baseUrl: props.baseUrl,
        port: props.port,
        views: views,
        modes: modes,
        showErrorAlert: showErrorAlert,
        onSelectedModeChange: onModeChange,
        changeHeaderText: setHeaderText
      }
    } as GlobalProps;
    let appNavProps = {
      defaultView: defaultView,
      selectedView: selectedView,
      onSelectedViewChange: onViewChange,
      selectedMode: selectedMode,
      headerText: headerText
    } as AppNavigationProps;
    let currentItemsProps = {
      ...globalProps,
      ...appNavProps,
      selectedView: selectedView
    } as CurrentItemsProps;
    let historyProps = {
      ...globalProps,
      ...appNavProps,
      selectedView: selectedView
    } as HistoryProps;

    return (
        <div>
            <div className={ "content-container " + (error !== undefined ? "err" : "")}>
                { selectedMode === "Current" &&
                  <CurrentItems {...currentItemsProps} />
                }
                { selectedMode === "History" &&
                  <History {...historyProps } />
                }
                { selectedMode === "Edit" &&
                  <EditViews {...globalProps} />
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
