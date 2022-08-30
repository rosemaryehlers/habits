import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Button from 'react-bootstrap/Button';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { GlobalProps } from './GlobalProps';
import ItemHistory, { ItemHistoryProps } from './ItemHistory';
import './History.css';
import { Accordion } from 'react-bootstrap';

export interface HistoryProps extends GlobalProps {
    selectedView?: string;
}

interface ItemStatus {
    goal?: number;
    count: number;
}
interface ItemThreshold {
    success: number;
    fail: number;
}
interface Item {
    id: number;
    name: string;
    type: string;
    status: ItemStatus;
    threshold?: ItemThreshold;
}
interface HistoryState {
    errorMsg?: string;
    items: Array<Item>;
    loadedItemHistories: Array<number>;
}


interface ItemHistoryEntry {
    dueDate: string;
    count: number;
}
interface ItemHistoryMetadata {
    name: string;
    type: string;
    goal?: number;
}

const weeks = 6;
const historyPath = "/history";

class History extends React.Component<HistoryProps, HistoryState> {
    constructor(props: HistoryProps){
        super(props);

        this.state = {
            items: [],
            loadedItemHistories: []
        };
    }

    onItemHistoryClick(e: any, itemId: number) {
        if(this.state.loadedItemHistories.includes(itemId)){
            e.preventDefault(); // history already loaded, do nothing
            return;
        }

        let newHistories = Object.assign([], this.state.loadedItemHistories);
        newHistories.push(itemId);
        this.setState({
            loadedItemHistories: newHistories
        });
    }

    fetchItems(){
        if(this.props.selectedView === undefined){
            console.log("No view to fetch items for.");
            return;
        }

        var url = this.props.global.baseUrl + 
            ":" + this.props.global.port + 
            historyPath + "?view=" + this.props.selectedView;

        fetch(url, { method: "GET" }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching history for view ${this.props.selectedView}: ${resp.statusText}`);
                this.setState({
                    errorMsg: "Error fetching history.",
                });
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                this.setState({
                    items: data.items,
                    errorMsg: undefined
                });
            }
        }).catch(err => {
            console.log(`Error fetching history for view ${this.props.selectedView}: ${err}`);
            this.setState({
                errorMsg: "Error fetching history."
            });
        });
    }

    componentDidMount() {
        // default is to the all-items view
        this.fetchItems();
    }
    componentDidUpdate(prevProps: HistoryProps, prevState: HistoryState) {
        if (this.props.selectedView !== prevProps.selectedView){
            // if the view has changed, the default is to show the all-items for a given view
            // so no need to handle single-item history view, we are moving away from it
            this.fetchItems();
        }
    }

    renderItemSuccess(item: Item){
        if(item.type === "finite" && item.status.goal !== undefined){
            let percentage = Math.floor( (item.status.count / item.status.goal) * 100 );
            let color = "";
            if(item.threshold !== undefined && percentage >= item.threshold.success){
                color = "success";
            }
            if(item.threshold !== undefined && percentage <= item.threshold.fail){
                color = "fail";
            }
            return (<span className={color}>{percentage}%</span>);
        } else if(item.type === "infinite"){
            let color = "";
            if(item.threshold !== undefined && item.status.count >= item.threshold.success){
                color = "success";
            }
            if(item.threshold !== undefined && item.status.count <= item.threshold.fail){
                color = "fail";
            }
            return (<span className={color}>{item.status.count}</span>);
        }

        return ("Unknown item type.");
    }
    renderItemHistory(){}

    render(){
        return (
            <Container fluid className="history page-content">
                <Row hidden={this.state.items !== undefined && this.state.items.length > 0}>
                    No items found!
                </Row>
                <Accordion className="left row" flush>
                { this.state.items.map(item => (
                    <Accordion.Item eventKey={item.id + ""}>
                        <Accordion.Header onClick={ (e) => { this.onItemHistoryClick(e, item.id); } }>
                            <Col className="left">{item.name}</Col>
                            <Col className="right">{this.renderItemSuccess(item)}</Col>
                        </Accordion.Header>
                        <Accordion.Body id={item.id + ""}>
                            <ItemHistory loaded={ this.state.loadedItemHistories.includes(item.id) } itemId={item.id} global={this.props.global} />
                        </Accordion.Body>
                    </Accordion.Item>
                )) }
                </Accordion>
            </Container>
        );
    }
}

export default History;