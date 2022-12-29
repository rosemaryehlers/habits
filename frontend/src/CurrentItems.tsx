import React, { useContext, useState, useEffect } from 'react';
import { Button, Container, Stack } from 'react-bootstrap';
import './CurrentItems.css';
import iconcheck from 'bootstrap-icons/icons/check.svg';
import { GlobalProps, Task } from './GlobalProps';
import AppNavigation, { AppNavigationProps } from './AppNavigation';
import { AlertsContext } from './Alerts';

export interface CurrentTask extends Task {
    count: number;
}
export interface CurrentItemsProps extends AppNavigationProps, GlobalProps {
    selectedView?: string;
}

const timeoutMilliseconds = 5000;
const markItemUrl = "/mark-item";

function CurrentItems(props: CurrentItemsProps) {
    const [items, setItems] = useState<Array<CurrentTask>>([]);
    const [showUndoSuccess, setShowUndoSuccess] = useState(false);
    const [undoTimeout, setUndoTimeout] = useState<NodeJS.Timeout>();
    const [lastMarkedId, setLastMarkedId] = useState<number>();
    const [undoSuccessTimeout, setUndoSuccessTimeout] = useState<NodeJS.Timeout>();
    const [dueDate, setDueDate] = useState<Date>();

    const alertsContext = useContext(AlertsContext);

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
                alertsContext.addAlert("Error fetching items.", "danger");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                var due = new Date(data.DueDate);
                if(isNaN(due.getTime())){
                    alertsContext.addAlert("Invalid due date", "danger");
                }

                setItems(data.Items);
                setDueDate(isNaN(due.getTime()) ? undefined : due);
                setLastMarkedId(undefined);
            }
        }).catch(err => {
            console.log(`Error fetching current items for view ${props.selectedView}: ${err}`);
            alertsContext.addAlert("Error fetching items.", "danger");
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

    function itemStatus(item: CurrentTask) {
        var status = [];
        if (item.type === "finite" && item.goal !== undefined) {
            for(var i = 0; i < item.goal - item.count; i++){
                status.push(<img src={iconcheck} className="svg-grey-light" alt="incomplete" key={item.id + "-todo-" + i} />);
            }
        }
        for(i = 0; i < item.count; i++){
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

        return items.map(item => (
            <React.Fragment key={item.id}>
                <div className="left">{item.name}</div>
                <div className="right">
                    <Stack direction="horizontal" gap={1}>
                        <div className="status">
                            {itemStatus(item)}
                        </div>
                        <Button onClick={onMarkItem} id={item.id + ""} variant="primary" size="sm"
                            disabled={(item.type !== "infinite" && item.goal !== undefined && item.goal === item.count)}
                        >
                            <img src={iconcheck} className="svg-white" alt="complete task" />
                        </Button>{' '}
                    </Stack>
                </div>
            </React.Fragment>
        ));
    }

    return (
        <>
            <AppNavigation {...props} />
            <Container fluid className="content-container current-items">
                {renderItems()}
            </Container>
            {/*
            <div className="content-footer">
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
            */}
        </>
    );
}

export default CurrentItems;