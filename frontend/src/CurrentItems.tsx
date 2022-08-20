import React from 'react';
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack';
import Toast from 'react-bootstrap/Toast';
import './CurrentItems.css';
import iconcheck from 'bootstrap-icons/icons/check.svg';
import Button from 'react-bootstrap/Button';
import { GlobalProps } from './GlobalProps';

interface CurrentItemStatus {
    goal?: number;
    count: number;
}
interface CurrentItem {
    id: number;
    name: string;
    type: string;
    status: CurrentItemStatus;
}
export interface CurrentItemsProps extends GlobalProps {
    selectedView?: string;
}
interface CurrentItemsState {
    items: Array<CurrentItem>;
    errorMsg?: string;
    errorTimeout?: NodeJS.Timeout;
    showUndoMark: boolean;
    undoTimeout?: NodeJS.Timeout;
    lastMarkedId?: number;
}

const timeoutMilliseconds = 5000;

class CurrentItems extends React.Component<CurrentItemsProps, CurrentItemsState> {
    constructor(props: CurrentItemsProps) {
        super(props);
        this.state = {
            items: [],
            errorMsg: undefined,
            errorTimeout: undefined,
            showUndoMark: false,
            undoTimeout: undefined,
            lastMarkedId: undefined
        }
        this.onMarkItem = this.onMarkItem.bind(this);
        this.dismissErrorAlert = this.dismissErrorAlert.bind(this);
        this.dismissUndoAlert = this.dismissUndoAlert.bind(this);
    }

    dismissErrorAlert(){
        if(this.state.errorTimeout){
            clearTimeout(this.state.errorTimeout);
        }

        this.setState({
            errorMsg: undefined,
            errorTimeout: undefined
        });
    }
    showErrorAlert(msg: string){
        if (this.state.errorTimeout){
            clearTimeout(this.state.errorTimeout);
        }

        let timeout = setTimeout(this.dismissErrorAlert, timeoutMilliseconds);
        this.setState({
            errorMsg: msg,
            errorTimeout: timeout
        });
    }

    dismissUndoAlert(){
        if(this.state.undoTimeout){
            clearTimeout(this.state.undoTimeout);
        }
        this.setState({
            lastMarkedId: undefined,
            undoTimeout: undefined,
            showUndoMark: false
        });
    }
    showUndoMark(lastId: number){
        if(this.state.undoTimeout){
            clearTimeout(this.state.undoTimeout);
        }

        let timeout = setTimeout(this.dismissUndoAlert, timeoutMilliseconds);
        this.setState({
            lastMarkedId: lastId,
            undoTimeout: timeout,
            showUndoMark: true
        });
    }

    fetchCurrentItems(){
        if(this.props.selectedView === undefined || this.props.selectedView === null || this.props.selectedView === ""){
            return; 
        }

        const currentItemsPath = "/currentitems";

        var url = this.props.global.baseUrl 
        + ":" + this.props.global.port 
        + currentItemsPath
        + "?view=" + this.props.selectedView;
        fetch(url, {
            method: "GET"
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching current items for view ${this.props.selectedView}: ${resp.statusText}`);
                this.showErrorAlert("Error fetching items.");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                this.setState({
                    items: data.Items,
                    errorMsg: undefined
                });
            }
        }).catch(err => {
            console.log(`Error fetching current items for view ${this.props.selectedView}: ${err}`);
            this.showErrorAlert("Error fetching items.");
        });
    }

    onMarkItem(e: any){
        let itemId = parseInt(e.currentTarget.id, 10);

        if(isNaN(itemId)){
            this.showErrorAlert("Invalid id, could not mark item.");
            e.preventDefault();
            return;
        }

        const markItemUrl = "/mark-item";
        var url = this.props.global.baseUrl
            + ":" + this.props.global.port
            + markItemUrl;
        let data = {
            id: itemId,
            action: "complete"
        };

        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} marking item ${itemId}: ${resp.statusText}`);
                this.showErrorAlert("Error marking item.");
            } else {
                // marked successfully, give option to undo
                this.showUndoMark(itemId);
            }
        }).catch(err => {
            console.log("Ya done ducked up", err);
            this.showErrorAlert("Error marking item.");
        });
    }

    componentDidMount() {
        this.fetchCurrentItems();
    }
    componentDidUpdate(prevProps: CurrentItemsProps) {
        if (this.props.selectedView !== prevProps.selectedView){
            this.fetchCurrentItems();
        }
    }

    itemStatus(item: CurrentItem) {
        var status = [];
        if (item.type === "finite" && item.status.goal !== undefined) {
            for(var i = 0; i < item.status.goal - item.status.count; i++){
                status.push(<img src={iconcheck} className="svg-grey-light" alt="incomplete" />);
            }
        }
        for(i = 0; i < item.status.count; i++){
            status.push(<img src={iconcheck} className="svg-green" alt="complete" />);
        }
        return status;
    }

    renderItems() {
        if(this.state.items === undefined || this.state.items.length === 0){
            return (
                <Container fluid className="empty">
                    No items found!
                </Container>
            );
        }

        return (
            <div>
                {
                    this.state.items.map(item => (
                        <Row>
                            <Col className="left">
                                <span>{item.name}</span>
                            </Col>
                            <Col className="right">
                                <Stack direction="horizontal" gap={1}>
                                    <div className="status">
                                        {this.itemStatus(item)}
                                    </div>
                                    <Button onClick={this.onMarkItem} id={item.id + ""} variant="primary" size="sm" disabled={(item.type !== "infinite" && item.status.goal !== undefined && item.status.goal === item.status.count)}>
                                        <img src={iconcheck} className="svg-white" alt="complete task" />
                                    </Button>{' '}
                                </Stack>
                            </Col>
                        </Row>
                    ))
                }
            </div>
        );
    }

    render() {
        return (
            <Container fluid className="current-items">
                {this.renderItems()}
                <Alert variant="danger" dismissible show={this.state.errorMsg !== undefined}
                    onClose={this.dismissErrorAlert}>
                    <span>{this.state.errorMsg}</span>
                </Alert>
                <Alert variant="success" dismissible show={this.state.showUndoMark}
                    onClose={ this.dismissUndoAlert }>
                    <span>Success!
                        <Alert.Link last-id={this.state.lastMarkedId}>Undo</Alert.Link>
                    </span>
                </Alert>
            </Container>
        );
    }
}

export default CurrentItems;