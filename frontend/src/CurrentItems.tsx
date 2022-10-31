import React, { useState, useEffect } from 'react';
import { Alert, Button, Col, Container, Row, Stack } from 'react-bootstrap';
import './CurrentItems.css';
import iconcheck from 'bootstrap-icons/icons/check.svg';
import { GlobalProps } from './GlobalProps';
import AppNavigation, { AppNavigationProps } from './AppNavigation';

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
export interface CurrentItemsProps extends AppNavigationProps, GlobalProps {
    selectedView?: string;
}

const timeoutMilliseconds = 5000;
const markItemUrl = "/mark-item";

function CurrentItems(props: CurrentItemsProps) {
    const [items, setItems] = useState<Array<CurrentItem>>([]);
    const [showUndoSuccess, setShowUndoSuccess] = useState(false);
    const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout>();
    const [lastMarkedId, setLastMarkedId] = useState<number>();
    const [undoSuccessTimeout, setUndoSuccessTimeout] = useState<NodeJS.Timeout>();
    const [dueDate, setDueDate] = useState<Date>();

    useEffect(() => {
        fetchCurrentItems();
    }, [props.selectedView]);

    useEffect(() => {
        if(dueDate === undefined || dueDate === null)
        {
            return;
        }

        var due = formatDueDate(dueDate);
        props.global.changeHeaderText(<span><b>Due:</b>&nbsp;{due}</span>);
    }, [dueDate]);

    function showUndoAlert(itemId: number){
        if(undoTimeout !== undefined){
            clearTimeout(undoTimeout);
        }

        var timeout = setTimeout(dismissUndoAlert, timeoutMilliseconds);
        setUndoTimeout(timeout);
        setLastMarkedId(itemId);
    }
    function dismissUndoAlert(){
        if(undoTimeout){
            clearTimeout(undoTimeout);
        }

        setUndoTimeout(undefined);
        setLastMarkedId(undefined);
    }
    function showUndoSuccessAlert(){
        if(undoSuccessTimeout !== undefined){
            clearTimeout(undoSuccessTimeout);
        }

        var timeout = setTimeout(dismissUndoSuccessAlert, timeoutMilliseconds);
        setShowUndoSuccess(true);
        setUndoSuccessTimeout(timeout);
        setLastMarkedId(undefined);
    }
    function dismissUndoSuccessAlert(){
        if(undoSuccessTimeout !== undefined){
            clearTimeout(undoSuccessTimeout);
        }

        setShowUndoSuccess(false);
        setUndoSuccessTimeout(undefined);
    }

    function fetchCurrentItems(){
        if(props.selectedView === undefined || props.selectedView === null || props.selectedView === ""){
            return; 
        }

        const currentItemsPath = "/currentitems";

        var url = props.global.baseUrl 
        + ":" + props.global.port 
        + currentItemsPath
        + "?view=" + props.selectedView;
        fetch(url, {
            method: "GET"
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching current items for view ${props.selectedView}: ${resp.statusText}`);
                props.global.showErrorAlert("Error fetching items.");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                var due = new Date(data.DueDate);
                if(isNaN(due.getTime())){
                    props.global.showErrorAlert("Invalid due date.");
                }

                setItems(data.Items);
                setDueDate(isNaN(due.getTime()) ? undefined : due);
                setLastMarkedId(undefined);
            }
        }).catch(err => {
            console.log(`Error fetching current items for view ${props.selectedView}: ${err}`);
            props.global.showErrorAlert("Error fetching items.");
        });
    }

    function onMarkItem(e: any){
        let itemId = parseInt(e.currentTarget.id, 10);

        if(isNaN(itemId)){
            props.global.showErrorAlert("Invalid id, could not mark item.");
            e.preventDefault();
            return;
        }

        var url = props.global.baseUrl
            + ":" + props.global.port
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
                props.global.showErrorAlert("Error marking item.");
            } else {
                // marked successfully, give option to undo
                showUndoAlert(itemId);
            }
        }).catch(err => {
            console.log("Ya done ducked up", err);
            props.global.showErrorAlert("Error marking item.");
        });
    }
    function onUnMarkItem(e: any){
        if(lastMarkedId === undefined){
            // might just be a double click, don't show error
            e.preventDefault();
            return;
        }

        var url = props.global.baseUrl
            + ":" + props.global.port
            + markItemUrl;
        let data = {
            id: lastMarkedId,
            action: "undo"
        };
        fetch(url, {
            method: "POST",
            body: JSON.stringify(data)
        }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} undoing item ${lastMarkedId}: ${resp.statusText}`);
                props.global.showErrorAlert("Error undoing item.");
            } else {
                showUndoSuccessAlert();
            }
        }).catch(err => {
            console.log("Ya done ducked up", err);
            props.global.showErrorAlert("Error undoing item.");
        });
    }

    function itemStatus(item: CurrentItem) {
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
    function formatDueDate(due?: Date){
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

    function renderItems() {
        if(items === undefined || items.length === 0){
            return (
                <Container fluid className="content-header">
                    No items found!
                </Container>
            );
        }

        return (
            <div>
                {
                    items.map(item => (
                        <Row key={item.id}>
                            <Col className="left">
                                <span>{item.name}</span>
                            </Col>
                            <Col className="right">
                                <Stack direction="horizontal" gap={1}>
                                    <div className="status">
                                        {itemStatus(item)}
                                    </div>
                                    <Button onClick={onMarkItem} id={item.id + ""} variant="primary" size="sm" disabled={(item.type !== "infinite" && item.status.goal !== undefined && item.status.goal === item.status.count)}>
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

    return (
        <div>
            <AppNavigation {...props} />
            <Container fluid className="current-items">
                {renderItems()}
            </Container>
            <div className="footer">
                <Alert variant="success" dismissible transition={false}
                    show={lastMarkedId !== undefined}
                    onClose={ dismissUndoAlert }>
                    <span>You did it! &nbsp;</span>
                    <Alert.Link onClick={ onUnMarkItem }>Undo</Alert.Link>
                </Alert>
                <Alert variant="success" dismissible transition={false}
                    show={showUndoSuccess}
                    onClose={ dismissUndoSuccessAlert }>
                    <span>Success!</span>
                </Alert>
            </div>
        </div>
    );
}

export default CurrentItems;