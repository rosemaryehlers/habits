export interface GlobalProps {
    global: {
        baseUrl: string;
        port: number;
        views: Array<string>;
        modes: Array<string>;
        onSelectedModeChange(mode: string): any;
        showErrorAlert(msg: string) : any;
        changeHeaderText: React.Dispatch<React.SetStateAction<JSX.Element | undefined>>;
    }
}