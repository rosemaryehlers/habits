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
import { time } from 'console';

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
    dueDate?: Date;
    items: Array<CurrentItem>;
    lastMarkedId?: number;
    undoTimeout?: NodeJS.Timeout;
    showUndoSuccess: boolean;
    undoSuccessTimeout?: NodeJS.Timeout;
}

const timeoutMilliseconds = 5000;
const markItemUrl = "/mark-item";

class CurrentItems extends React.Component<CurrentItemsProps, CurrentItemsState> {
    constructor(props: CurrentItemsProps) {
        super(props);
        this.state = { 
            items: [],
            showUndoSuccess: false
        }
        this.onMarkItem = this.onMarkItem.bind(this);
        this.onUnMarkItem = this.onUnMarkItem.bind(this);
        this.dismissUndoAlert = this.dismissUndoAlert.bind(this);
        this.showUndoAlert = this.showUndoAlert.bind(this);
        this.showUndoSuccessAlert = this.showUndoSuccessAlert.bind(this);
        this.dismissUndoSuccessAlert = this.dismissUndoSuccessAlert.bind(this);
    }


    showUndoAlert(itemId: number){
        if(this.state.undoTimeout !== undefined){
            clearTimeout(this.state.undoTimeout);
        }

        var timeout = setTimeout(this.dismissUndoAlert, timeoutMilliseconds);
        this.setState({
            lastMarkedId: itemId,
            undoTimeout: timeout
        });
    }
    dismissUndoAlert(){
        if(this.state.undoTimeout){
            clearTimeout(this.state.undoTimeout);
        }

        this.setState({
            lastMarkedId: undefined,
            undoTimeout: undefined
        });
    }
    showUndoSuccessAlert(){
        if(this.state.undoSuccessTimeout !== undefined){
            clearTimeout(this.state.undoSuccessTimeout);
        }

        var timeout = setTimeout(this.dismissUndoSuccessAlert, timeoutMilliseconds);
        this.setState({
            showUndoSuccess: true,
            undoSuccessTimeout: timeout,
            lastMarkedId: undefined // don't let people accidentally undo twice
        });
    }
    dismissUndoSuccessAlert(){
        if(this.state.undoSuccessTimeout !== undefined){
            clearTimeout(this.state.undoSuccessTimeout);
        }

        this.setState({
            showUndoSuccess: false,
            undoSuccessTimeout: undefined
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
                this.props.global.showErrorAlert("Error fetching items.");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                var due = new Date(data.DueDate);
                if(isNaN(due.getTime())){
                    this.props.global.showErrorAlert("Invalid due date.");
                }

                this.setState({
                    items: data.Items,
                    dueDate: isNaN(due.getTime()) ? undefined : due,
                    lastMarkedId: undefined
                });
            }
        }).catch(err => {
            console.log(`Error fetching current items for view ${this.props.selectedView}: ${err}`);
            this.props.global.showErrorAlert("Error fetching items.");
        });
    }

    onMarkItem(e: any){
        let itemId = parseInt(e.currentTarget.id, 10);

        if(isNaN(itemId)){
            this.props.global.showErrorAlert("Invalid id, could not mark item.");
            e.preventDefault();
            return;
        }

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
                this.props.global.showErrorAlert("Error marking item.");
            } else {
                // marked successfully, give option to undo
                this.showUndoAlert(itemId);
            }
        }).catch(err => {
            console.log("Ya done ducked up", err);
            this.props.global.showErrorAlert("Error marking item.");
        });
    }
    onUnMarkItem(e: any){
        if(this.state.lastMarkedId === undefined){
            // might just be a double click, don't show error
            e.preventDefault();
            return;
        }

        var url = this.props.global.baseUrl
            + ":" + this.props.global.port
            + markItemUrl;
        let data = {
            id: this.state.lastMarkedId,
            action: "undo"
        };
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} undoing item ${this.state.lastMarkedId}: ${resp.statusText}`);
                this.props.global.showErrorAlert("Error undoing item.");
            } else {
                this.showUndoSuccessAlert();
            }
        }).catch(err => {
            console.log("Ya done ducked up", err);
            this.props.global.showErrorAlert("Error undoing item.");
        });
    }

    componentDidMount() {
        this.fetchCurrentItems();
    }
    componentDidUpdate(prevProps: CurrentItemsProps, prevState: CurrentItemsState) {
        if (this.props.selectedView !== prevProps.selectedView){
            this.fetchCurrentItems();
        }

        if(this.state.dueDate !== prevState.dueDate){
            var due = this.formatDueDate(this.state.dueDate);
            this.props.global.changeHeaderText(<span><b>Due:</b>&nbsp;{due}</span>);
        }
    }

    itemStatus(item: CurrentItem) {
        var status = [];
        if (item.type === "finite" && item.status.goal !== undefined) {
            for(var i = 0; i < item.status.goal - item.status.count; i++){
                status.push(<img src={iconcheck} className="svg-grey-light" alt="incomplete" key={item.id + "-todo-" + i} />);
            }
        }
        for(i = 0; i < item.status.count; i++){
            status.push(<img src={iconcheck} className="svg-green" alt="complete" key={item.id + "-done-" + i}/>);
        }
        return status;
    }
    formatDueDate(due?: Date){
        if(due === undefined){
            return "";
        }

        var opts = {
            weekday: "short",
            month: "numeric",
            day: "numeric"
        } as Intl.DateTimeFormatOptions;
        return due.toLocaleDateString("en-us", opts);
    }

    renderItems() {
        if(this.state.items === undefined || this.state.items.length === 0){
            return (
                <Container fluid className="content-header">
                    No items found!
                </Container>
            );
        }

        return (
            <div>
                {
                    this.state.items.map(item => (
                        <Row key={item.id}>
                            <Col className="left">
                                <span>{item.name}</span>
                            </Col>
                            <Col className="right">
                                <Stack direction="horizontal" gap={1}>
                                    <div className="status">
                                        {this.itemStatus(item)}
                                    </div>
                                    <Button onClick={this.onMarkItem} id={item.id + ""} variant="primary" size="sm" disabled={(item.type !== "infinite" && item.status.goal !== undefined && item.status.goal === item.status.count)}>
                                        <img src={iconcheck} className="svg-white" alt="complete task" key={item.id + "-complete-task"} />
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
            <div>
                <Container fluid className="current-items">
                    {this.renderItems()}
                </Container>
                <div className="footer">
                    <Alert variant="success" dismissible transition={false}
                        show={this.state.lastMarkedId !== undefined}
                        onClose={ this.dismissUndoAlert }>
                        <span>You did it! &nbsp;</span>
                        <Alert.Link onClick={ this.onUnMarkItem }>Undo</Alert.Link>
                    </Alert>
                    <Alert variant="success" dismissible transition={false}
                        show={this.state.showUndoSuccess}
                        onClose={ this.dismissUndoSuccessAlert }>
                        <span>Success!</span>
                    </Alert>
                </div>
            </div>
        );
    }
}

export default CurrentItems;