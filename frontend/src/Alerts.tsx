export interface AppAlert {
    id: string;
    msg: JSX.Element;
    style: string;
    callback: any|undefined;
    timeout: NodeJS.Timeout;
}