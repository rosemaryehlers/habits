import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import Stack from 'react-bootstrap/Stack';
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
    error: boolean;
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
            items: [],
            error: true
        }
    }

    fetchCurrentItems(){
        if(this.props.selectedView === undefined || this.props.selectedView === null || this.props.selectedView === ""){
            return; 
        }

        const currentItemsPath = "/currentitems";
        let err = false;

        var url = this.props.global.baseUrl 
        + ":" + this.props.global.port 
        + currentItemsPath
        + "?view=" + this.props.selectedView;
        fetch(url, {
            method: "GET"
        }).then(resp => {
            if(!resp.ok){
                console.log("Error fetching current items: " + resp.status);
                err = true;
                return undefined;
            } else {
                return resp.json();
            }
        }).then(data => {
            let newItems = [];
            if(data != undefined){
                newItems = data.Items;
            }
            this.setState({
                items: newItems,
                error: err
            });
        })
    }

    componentDidMount() {
        this.fetchCurrentItems();
    }
    componentDidUpdate(prevProps: CurrentItemsProps) {
        if (this.props.selectedView != prevProps.selectedView){
            this.fetchCurrentItems();
        }
    }

    renderPopulatedResponse() {
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

    render() {
        if (this.state.error){
            return (<div className="error">Error occurred.</div>);
        } else if (this.state.items.length === 0){
            return (<div className="empty">No items found!</div>);
        }

        return this.renderPopulatedResponse();
    }
}

export default CurrentItems;