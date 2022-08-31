import React, { useEffect, useState } from 'react';
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

function History(props: HistoryProps){
    const [items, setItems] = useState<Array<Item>>([]);
    const [loadedHistories, setLoadedHistories] = useState<Array<number>>([]);
    const historyPath = "/history";

    // fetch view history
    useEffect(() => {
        if(props.selectedView === undefined){
            return;
        }

        var url = props.global.baseUrl + 
            ":" + props.global.port + 
            historyPath + "?view=" + props.selectedView;

        fetch(url, { method: "GET" }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching history for view ${props.selectedView}: ${resp.statusText}`);
                props.global.showErrorAlert("Error fetching history");
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            if(data !== undefined){
                setItems(data.items);
            }
        }).catch(err => {
            console.log(`Error fetching history for view ${props.selectedView}: ${err}`);
            props.global.showErrorAlert("Error fetching history");
        });
    }, [props.selectedView]);

    function onItemHistoryClick(e: any, itemId: number) {
        if(loadedHistories.includes(itemId)){
            e.preventDefault(); // history already loaded, do nothing
            return;
        }

        let newHistories = Object.assign([], loadedHistories);
        newHistories.push(itemId);
        setLoadedHistories(newHistories);
    }

    function renderItemSuccess(item: Item){
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

    if(items.length === 0){
        return <Row>No items found!</Row>
    }

    return (
        <Container fluid className="history page-content">
            <Accordion className="left row" flush>
            { items.map(item => (
                <Accordion.Item eventKey={item.id + ""} key={item.id}>
                    <Accordion.Header onClick={ (e) => { onItemHistoryClick(e, item.id); } }>
                        <Col className="left">{item.name}</Col>
                        <Col className="right">{ renderItemSuccess(item) }</Col>
                    </Accordion.Header>
                    <Accordion.Body id={item.id + ""}>
                        { loadedHistories.includes(item.id) &&
                            <ItemHistory itemId={item.id} global={props.global} />
                        }
                    </Accordion.Body>
                </Accordion.Item>
            )) }
            </Accordion>
        </Container>
    );

}

export default History;