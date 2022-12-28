export interface GlobalProps {
    global: {
        baseUrl: string;
        port: number;
        views: Array<string>;
        modes: Array<string>;
        alert: JSX.Element|undefined;
        onSelectedModeChange(mode: string): any;
        showErrorAlert(msg: string) : any;
        changeHeaderText: React.Dispatch<React.SetStateAction<JSX.Element | undefined>>;
    }
}

export interface Task {
    id: number;
    name: string;
    type: string;
    goal?: number;
}