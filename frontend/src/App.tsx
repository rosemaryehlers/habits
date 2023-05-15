import { useContext, useEffect, useState } from 'react'
import { Alert } from 'react-bootstrap';
import CurrentItems, { CurrentItemsProps } from './CurrentItems';
import './App.css';
import { GlobalProps } from './GlobalProps';
import History, { HistoryProps } from './History';
import Configure from './Configure';
import { AppNavigationProps } from './AppNavigation';
import { AppAlert } from './Alerts';
import { v4 as uuidv4 } from 'uuid';

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
    const [currentAlerts, setCurrentAlerts] = useState<Array<AppAlert>>([]);

    // initialize app
    useEffect(() => {
        const viewsPath = "/views";
        let url = props.baseUrl + ":" + props.port + viewsPath;

        fetch(url, { "method": "GET" }).then( resp => {
            if(!resp.ok){
              console.log(`Error ${resp.status} fetching views: ${resp.statusText}`);
              addAlert("Error fetching views.", "danger");
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
            addAlert("Error fetching views.", "danger");
        });
    }, [props.baseUrl, props.port]);

    function onViewChange(newView: string) {
      setSelectedView(newView);
    }
    function onModeChange(newMode: string) {
      currentAlerts.map(a => clearAlert(a.id));
      setSelectedMode(newMode);
    }

    function addAlert(msg: React.ReactNode | ((id: string) => React.ReactNode), style: string) {
      let id = uuidv4();
      let newTimeout = setTimeout(clearAlert, timeoutMilliseconds, id);
      const message = typeof msg === "function" ? msg(id) : msg;
      let newAlert = {
          id: id,
          msg: message,
          style: style,
          timeout: newTimeout
      } as AppAlert;
      setCurrentAlerts(currentAlerts => [...currentAlerts, newAlert]);
    }
    function clearAlert(id: string){
      let timeout = currentAlerts.find(t => t.id === id)?.timeout;
      if(timeout){
          clearTimeout(timeout);
      }

      setCurrentAlerts(currentAlerts => currentAlerts.filter(t => t.id != id));
    }

    let globalProps = {
      global: {
        baseUrl: props.baseUrl,
        port: props.port,
        views: views,
        modes: modes,
        onSelectedModeChange: onModeChange,
        changeHeaderText: setHeaderText,
        addAlert: addAlert,
        clearAlert: clearAlert
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
      <>
          <div className={ "app-container " + (error !== undefined ? "err" : "") } >
              { selectedMode === "Current" &&
                <CurrentItems {...currentItemsProps} />
              }
              { selectedMode === "History" &&
                <History {...historyProps } />
              }
              { selectedMode === "Configure" &&
                <Configure {...globalProps} />
              }
          </div>
          <div className="footer-container">
              {
                currentAlerts.map(a => (
                  <Alert variant={a.style} dismissible transition={false} onClose={ () => {clearAlert(a.id);} } key={a.id} id={a.id}>
                    {a.msg}
                  </Alert>
                ))
              }
          </div>
      </>
    );
}

export default App;
