import React from 'react';
import { Row, Col, Button, Alert } from 'react-bootstrap';
import { GlobalProps } from './GlobalProps';

export interface ItemHistoryProps extends GlobalProps {
    itemId: number;
    loaded: boolean;
}

interface Entry {
    dueDate: string;
    count: number;
}
interface ItemMetadata {
    name: string;
    type: string;
    goal?: number;
}
interface ItemHistoryState {
    entries: Array<Entry>;
    itemMetadata?: ItemMetadata;
}

const historyPath = "/history";

class ItemHistory extends React.Component<ItemHistoryProps, ItemHistoryState> {
    constructor(props: ItemHistoryProps){
        super(props);

        this.state = {
            entries: [],
            itemMetadata: undefined,
        };
    }


    fetchItemHistory(){
        if(!this.props.loaded){
            return;
        }

        if(this.props.itemId === undefined || isNaN(this.props.itemId)){
            this.props.global.showErrorAlert(`Unable to fetch item history, invalid id: ${this.props.itemId}`);
            return;
        }

        var url = this.props.global.baseUrl + 
            ":" + this.props.global.port + historyPath + 
            "?item=" + this.props.itemId;

        fetch(url, { method: "GET" }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching history for item ${this.props.itemId}: ${resp.statusText}`);
                return undefined;
            }

            return resp.json();
        }).then(data => {
            if(data === undefined){
                this.props.global.showErrorAlert("Error fetching history for item.");
                return;
            }

            let metadata = {
                name: data.name,
                type: data.type
            } as ItemMetadata;
            if(data.goal !== undefined){
                metadata.goal = data.goal;
            }

            this.setState({
                entries: data.entries,
                itemMetadata: metadata
            });
        }).catch(err => {
            console.log(`Error fetching history for item ${this.props.itemId}: ${err}`);
            this.props.global.showErrorAlert("Error fetching history for item.");
        });
    }

    componentDidMount(){
        this.fetchItemHistory();
    }
    componentDidUpdate(prevProps: ItemHistoryProps){
        if(prevProps.loaded != this.props.loaded){
            this.fetchItemHistory();
        }
    }

    renderEntrySuccess(entry: Entry){
        if(this.state.itemMetadata === undefined){
            this.props.global.showErrorAlert("No item metadata!");
            return;
        }

        if(this.state.itemMetadata.type === "infinite"){
            return (<span>{ entry.count }</span>);
        }
        else if(this.state.itemMetadata.type === "finite"){
            if(this.state.itemMetadata.goal === undefined){
                this.props.global.showErrorAlert("No goal for finite item type.");
                return;
            }

            let color = entry.count >= this.state.itemMetadata.goal ? "success" : "fail";
            return (<span className={color}>{entry.count} / {this.state.itemMetadata.goal}</span>);
        }

        this.props.global.showErrorAlert("Unknown item type " + this.state.itemMetadata.type);
        return;
    }

    render() {
        if(!this.props.loaded){
            console.log(`Item history for ${this.props.itemId} not loaded`);
            return (<span>Loading...</span>);
        }

        if(this.state.entries.length === 0){
            return (<Row><Col>No entries.</Col></Row>);
        }

        return (
            <div className="item-history">
                {
                    this.state.entries.map(entry => (
                        <Row>
                            <Col className="left">
                                { (new Date(entry.dueDate)).toLocaleDateString("en-us", {month: '2-digit', day: '2-digit'}) }
                            </Col>
                            <Col className="right">
                                { this.renderEntrySuccess(entry) }
                            </Col>
                        </Row>
                    ))
                }
            </div>
        );
    }
}

export default ItemHistory;