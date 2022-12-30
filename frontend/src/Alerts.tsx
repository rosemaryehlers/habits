import React, { useState, createContext } from 'react';
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
    addAlert: (msg: React.ReactNode, style: string, callback?: (id: string) => {}) => void,
    clearAlert: (id: string) => void
}
interface AlertsProps {
    currentAlerts: Array<AppAlert>,
    setCurrentAlerts: (alerts: Array<AppAlert>) => void,
    children: React.ReactNode
}

const timeoutMilliseconds = 10000;
export const AlertsContext = createContext<AlertContext>({
    alerts: [],
    addAlert: (msg: React.ReactNode, style: string, callback?: (id: string) => {}) => { console.log("Alert context not initialized"); },
    clearAlert: (id: string) => { console.log("Well fuck"); }
});

export function AlertsProvider(props: AlertsProps) {

    function clearAlert(id: string){
        let timeout = props.currentAlerts.find(t => t.id === id)?.timeout;
        if(timeout){
            clearTimeout(timeout);
        }

        let newCurrent = props.currentAlerts.filter(t => t.id != id);
        props.setCurrentAlerts(newCurrent);
    }

    function addAlert(msg: JSX.Element, style: string, callback: (id: string) => {}) {
        console.log("add alert triggered");
        let id = uuidv4();
        let newTimeout = setTimeout(clearAlert, timeoutMilliseconds, id);
        let newAlert = {
            id: id,
            msg: msg,
            style: style,
            callback: callback,
            timeout: newTimeout
        } as AppAlert;
        let test = [...props.currentAlerts, newAlert];
        console.log(test);
        props.setCurrentAlerts(test);
        console.log("current alerts", props.currentAlerts);
    }

    let test = {
        alerts: props.currentAlerts,
        addAlert: addAlert,
        clearAlert: clearAlert
    } as AlertContext;

    return (<AlertsContext.Provider value={test}>
        { props.children }
    </AlertsContext.Provider>);
}