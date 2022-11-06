import React, { useEffect, useState } from 'react';
import { Accordion, Container, Row, Table } from 'react-bootstrap';
import { GlobalProps, Task } from './GlobalProps';
import TaskHistory from './TaskHistory';
import './History.css';
import AppNavigation, { AppNavigationProps } from './AppNavigation';

export interface HistoryProps extends AppNavigationProps, GlobalProps {
    selectedView?: string;
}

interface TaskThreshold {
    success: number;
    fail: number;
}
interface HistoricalTask extends Task {
    count: number;
    threshold?: TaskThreshold;
}

function History(props: HistoryProps){
    const [items, setItems] = useState<Array<HistoricalTask>>([]);
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

    function renderItemSuccess(item: HistoricalTask){
        if(item.type === "finite" && item.goal !== undefined){
            let percentage = Math.floor( (item.count / item.goal) * 100 );
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
            if(item.threshold !== undefined && item.count >= item.threshold.success){
                color = "success";
            }
            if(item.threshold !== undefined && item.count <= item.threshold.fail){
                color = "fail";
            }
            return (<span className={color}>{item.count}</span>);
        }

        return ("Unknown item type.");
    }

    if(items.length === 0){
        return <Row>No items found!</Row>
    }

    return (
        <div>
            <AppNavigation {...props} />
            <Container fluid className="history page-content">
                <Accordion flush>
                    <Table >
                        <tbody>
                { items.map(item => (
                    <tr key={item.id}><td>
                    <Accordion.Item eventKey={item.id + ""}>
                        <Accordion.Header onClick={ (e) => { onItemHistoryClick(e, item.id); } }>
                            <div className="col left">{item.name}</div>
                            <div className="col right">{ renderItemSuccess(item) }</div>
                        </Accordion.Header>
                        <Accordion.Body id={item.id + ""}>
                            { loadedHistories.includes(item.id) &&
                                <TaskHistory itemId={item.id} {...props} />
                            }
                        </Accordion.Body>
                    </Accordion.Item>
                    </td></tr>
                )) }
                        </tbody>
                    </Table>
                </Accordion>
            </Container>
        </div>
    );

}

export default History;