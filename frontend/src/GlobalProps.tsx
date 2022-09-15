export interface GlobalProps {
    global: 
    {
        baseUrl: string;
        port: number;
        showErrorAlert(msg: string) : any;
        changeHeaderText: React.Dispatch<React.SetStateAction<JSX.Element | undefined>>;
    }
}