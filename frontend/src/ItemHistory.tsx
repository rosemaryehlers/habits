import { useEffect, useState } from 'react';
import { Row, Col } from 'react-bootstrap';
import { GlobalProps } from './GlobalProps';

export interface ItemHistoryProps extends GlobalProps {
    itemId: number;
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
    loaded: boolean;
}

const historyPath = "/history";

function ItemHistory(props: ItemHistoryProps) {
    // put everything in one object because we want it to be updated together
    // we don't want a call to render when we've only updated the entries but not the item metadata, etc
    const [state, setState] = useState<ItemHistoryState>();

    // fetch item history and update state
    useEffect(() => {
        if(props.itemId === undefined){
            return;
        }

        var url = props.global.baseUrl + 
            ":" + props.global.port + historyPath + 
            "?item=" + props.itemId;

        fetch(url, { method: "GET" }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching history for item ${props.itemId}: ${resp.statusText}`);
                return undefined;
            }

            return resp.json();
        }).then(data => {
            if(data === undefined){
                props.global.showErrorAlert("Error fetching history for item.");
                setState(undefined);
                return;
            }

            let metadata = {
                name: data.name,
                type: data.type
            } as ItemMetadata;
            if(data.goal !== undefined){
                metadata.goal = data.goal;
            }

            let newState = {
                entries: data.entries,
                itemMetadata: metadata,
                loaded: true
            } as ItemHistoryState;

            setState(newState);
        }).catch(err => {
            console.log(`Error fetching history for item ${props.itemId}: ${err}`);
            setState(undefined);
            props.global.showErrorAlert("Error fetching history for item.");
        });
    }, [props.itemId]);

    if(props.itemId === undefined || state === undefined || !state.loaded){
        return (<div>Loading...</div>);
    }

    if(state.entries.length === 0){
        return (<Row><Col>No entries.</Col></Row>);
    }

    function renderEntrySuccess(entry: Entry){
        if(state === undefined || state.itemMetadata === undefined){
            props.global.showErrorAlert("No item metadata!");
            return;
        }

        if(state.itemMetadata.type === "infinite"){
            return (<span>{ entry.count }</span>);
        }
        else if(state.itemMetadata.type === "finite"){
            if(state.itemMetadata.goal === undefined){
                props.global.showErrorAlert("No goal for finite item type.");
                return;
            }

            let color = entry.count >= state.itemMetadata.goal ? "success" : "fail";
            return (<span className={color}>{entry.count} / {state.itemMetadata.goal}</span>);
        }

        props.global.showErrorAlert("Unknown item type " + state.itemMetadata.type);
        return;
    }

    return (
        <div className="item-history">
            {
                state.entries.map(entry => (
                    <Row key={entry.dueDate}>
                        <Col className="left">
                            { (new Date(entry.dueDate)).toLocaleDateString("en-us", {month: '2-digit', day: '2-digit'}) }
                        </Col>
                        <Col className="right">
                            { renderEntrySuccess(entry) }
                        </Col>
                    </Row>
                ))
            }
        </div>
    );
}

export default ItemHistory;