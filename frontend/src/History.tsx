import React from 'react';
import { GlobalProps } from './GlobalProps';

export interface HistoryProps extends GlobalProps {
    selectedView?: string;
}
interface HistoryState {
    foo: string;
}

class History extends React.Component<HistoryProps, HistoryState> {
    constructor(props: HistoryProps){
        super(props);
    }

    render(){
        return (
            <div>History!</div>
        );
    }
}

export default History;