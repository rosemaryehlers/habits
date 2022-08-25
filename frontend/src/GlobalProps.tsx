export interface GlobalProps {
    global: 
    {
        baseUrl: string;
        port: number;
        showErrorAlert(msg: string) : any;
        changeHeaderText(text?: JSX.Element) : any;
    }
}