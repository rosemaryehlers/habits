import React from "react";

export interface GlobalProps {
    global: {
        baseUrl: string;
        port: number;
        views: Array<string>;
        modes: Array<string>;
        alert: JSX.Element|undefined;
        onSelectedModeChange(mode: string): any;
        changeHeaderText: React.Dispatch<React.SetStateAction<JSX.Element | undefined>>;
        addAlert: (msg: React.ReactNode, style: string, callback?: (id: string) => void) => void;
    }
}

export interface Task {
    id: number;
    name: string;
    type: string;
    goal?: number;
}