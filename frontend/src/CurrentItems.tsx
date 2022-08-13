import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack';
import './CurrentItems.css';
import iconcheck from 'bootstrap-icons/icons/check.svg';
import Button from 'react-bootstrap/Button';

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
interface CurrentItemsProps {
    selectedView: string;
}
interface CurrentItemsState {
    items: Array<CurrentItem>;
}

function ItemStatus(item: CurrentItem) {
    var status = [];
    if (item.type === "finite" && item.status.goal != undefined) {
        for(var i = 0; i < item.status.goal - item.status.count; i++){
            status.push(<img src={iconcheck} className="svg-grey-light" />);
        }
    }
    for(var i = 0; i < item.status.count; i++){
        status.push(<img src={iconcheck} className="svg-green" />);
    }
    return status;
}

class CurrentItems extends React.Component<CurrentItemsProps, CurrentItemsState> {
    constructor(props: CurrentItemsProps) {
        super(props);
        this.state = {
            items: [
                {
                    id: 1,
                    name: "Clean Kitchen",
                    type: "finite",
                    status: {
                        goal: 1,
                        count: 0
                    }
                },
                {
                    id: 2,
                    name: "Clean Bathroom",
                    type: "finite",
                    status: {
                        goal: 1,
                        count: 1
                    }
                },
                {
                    id: 3,
                    name: "Daily Chores",
                    type: "infinite",
                    status: {
                        count: 2
                    }
                },
                {
                    id: 4,
                    name: "Exercise",
                    type: "finite",
                    status: {
                        goal: 4,
                        count: 1
                    }
                }
            ]
        }
    }

    render() {
        return (
            <Container fluid className="current-items">
                {
                    this.state.items.map(item => (
                        <Row>
                            <Col className="left">
                                    <span>{item.name}</span>
                            </Col>
                            <Col className="right">
                                <Stack direction="horizontal" gap={1}>
                                    <div className="status">
                                        {ItemStatus(item)}
                                    </div>
                                    <Button variant="primary" size="sm" disabled={(item.type != "infinite" && item.status.goal != undefined && item.status.goal === item.status.count)}>
                                        <img src={iconcheck} className="svg-white" />
                                    </Button>{' '}
                                </Stack>
                            </Col>
                        </Row>
                    ))
                }
            </Container>
        );
    }
}

export default CurrentItems;