import React from 'react';
import { GlobalProps } from './GlobalProps';

export interface ItemHistoryProps extends GlobalProps {
    itemId: number;
}

interface ItemHistoryState {
    entries: Array<any>;
    errorMsg?: string;
}

const historyPath = "/history";

class ItemHistory extends React.Component<ItemHistoryProps, ItemHistoryState> {
    constructor(props: ItemHistoryProps){
        super(props);

        this.state = {
            entries: [],
            errorMsg: undefined
        };
    }


    fetchItemHistory(){
        if(this.props.itemId === undefined || isNaN(this.props.itemId)){
            this.setState({
                errorMsg: `Unable to fetch item history, invalid id: ${this.props.itemId}`
            });
            return;
        }

        var url = this.props.global.baseUrl + 
            ":" + this.props.global.port + historyPath + 
            "?item=" + this.props.itemId;

        fetch(url, { method: "GET" }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching history for item ${this.props.itemId}: ${resp.statusText}`);
                this.setState({
                    errorMsg: "Error fetching history for item."
                    // don't clear itemId; just because we failed to fetch the history,
                    // doesn't mean we've moved from the current attempted "view"
                });
                return undefined;
            }

            return resp.json();
        }).then(data => {
            if(data === undefined){
                console.log(`Error parsing json response for item history.`);
                this.setState({
                    errorMsg: "Error fetching history for item."
                });
                return;
            }

            console.log(data.entries);
            this.setState({
                entries: data.entries,
                errorMsg: undefined
            });
        }).catch(err => {
            console.log(`Error fetching history for item ${this.props.itemId}: ${err}`);
            this.setState({
                errorMsg: "Error fetching history for item."
            });
        });
    }

    componentDidMount(){
        console.log("Item history did mount.");
        this.fetchItemHistory();
    }
    componentDidUpdate(prevProps: ItemHistoryProps){
        console.log(`Item history did update. Prev: ${prevProps.itemId}, current: ${this.props.itemId}`);
        if(this.props.itemId !== prevProps.itemId){
            this.fetchItemHistory();
        }
    }

    render() {
        return (<div>Item history!</div>);
    }
}

export default ItemHistory;