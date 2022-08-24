export interface GlobalProps {
    global: 
    {
        baseUrl: string;
        port: number;
        showErrorAlert(msg: string) : any;
        showUndoMarkAlert(id: number) : any;
    }
}