export interface GlobalProps {
    global: {
        baseUrl: string;
        port: number;
        views: Array<string>;
        modes: Array<string>;
        showErrorAlert(msg: string) : any;
        changeHeaderText: React.Dispatch<React.SetStateAction<JSX.Element | undefined>>;
    },
    appNav: {
        defaultView?: string;
        selectedView?: string;
        selectedMode?: string;
        onSelectedViewChange(view: string): any;
        onSelectedModeChange(mode: string): any;
        headerText?: JSX.Element;
    }
}