import { useState, createContext } from 'react';
import { v4 as uuidv4 } from 'uuid';

export interface AppAlert {
    id: string;
    msg: JSX.Element;
    style: string;
    callback: any|undefined;
    timeout: NodeJS.Timeout;
}
export interface AlertContext {
    alerts: Array<AppAlert>,
    addAlert: (msg: JSX.Element, style: string, callback: (id: string) => {}) => void,
    clearAlert: (id: string) => void
}

const timeoutMilliseconds = 10000;
export const AlertsContext = createContext<AlertContext>({
    alerts: [],
    addAlert: (msg: JSX.Element, style: string, callback: (id: string) => {}) => { console.log("Alert context not initialized"); },
    clearAlert: (id: string) => { console.log("Well fuck"); }
});

export function AlertsProvider(children: any) {
    const [currentAlerts, setCurrentAlerts] = useState<Array<AppAlert>>([]);

    function clearAlert(id: string){
        let timeout = currentAlerts.find(t => t.id === id)?.timeout;
        if(timeout){
            clearTimeout(timeout);
        }

        let newCurrent = currentAlerts.filter(t => t.id != id);
        setCurrentAlerts(newCurrent);
    }

    function addAlert(msg: JSX.Element, style: string, callback: (id: string) => {}) {
        let id = uuidv4();
        let newTimeout = setTimeout(clearAlert, timeoutMilliseconds, id);
        let newAlert = {
            id: id,
            msg: msg,
            style: style,
            callback: callback,
            timeout: newTimeout
        } as AppAlert;
        setCurrentAlerts([newAlert, ...currentAlerts]);
    }

    let test = {
        alerts: currentAlerts,
        addAlert: addAlert,
        clearAlert: clearAlert
    } as AlertContext;

    return (<AlertsContext.Provider value={test}>
        {children}
    </AlertsContext.Provider>);
}