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
    itemId?: number;
}

const weeks = 6;
const historyPath = "/history";

class History extends React.Component<HistoryProps, HistoryState> {
    constructor(props: HistoryProps){
        super(props);

        this.state = {
            items: [],
            itemId: undefined
        };

        this.onItemClick = this.onItemClick.bind(this);
        this.clearItemId = this.clearItemId.bind(this);
    }

    clearItemId(e: any){
        console.log("Clearing item id");
        this.setState({
            itemId: undefined
        });
        this.props.global.changeHeaderText(undefined);
    }
    onItemClick(e: any){
        let id = parseInt(e.currentTarget.value);
        if(isNaN(id)){
            console.log(`Invalid item id on item click: ${e}`);
            this.setState({
                errorMsg: "Invalid item id."
            });
            e.preventDefault();
            return;
        }

        if(id === this.state.itemId){
            e.preventDefault();
            return;
        }

        this.setState({
            itemId: id
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
                    errorMsg: undefined,
                    itemId: undefined
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

    renderContent(){
        if(this.state.itemId === undefined){
            return (
                this.state.items.map(item => (
                    <Accordion className="left row" flush>
                        <Accordion.Item eventKey={item.id + ""}>
                            <Accordion.Header>
                                <Col className="left">{item.name}</Col>
                                <Col className="right">{this.renderItemSuccess(item)}</Col>
                            </Accordion.Header>
                            <Accordion.Body>
                                Loading...
                            </Accordion.Body>
                        </Accordion.Item>
                    </Accordion>
                ))
            );
        } else {
            return (<ItemHistory global={this.props.global} 
                itemId={this.state.itemId} 
                clearItemId={this.clearItemId} />);
        }
    }

    render(){

        return (
            <Container fluid className="history page-content">
                <Row hidden={this.state.items !== undefined && this.state.items.length > 0}>
                    No items found!
                </Row>
                { this.renderContent() }
            </Container>
        );
    }
}

export default History;