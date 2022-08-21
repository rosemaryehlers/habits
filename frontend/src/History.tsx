import React from 'react';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Container from 'react-bootstrap/Container';
import { GlobalProps } from './GlobalProps';

export interface HistoryProps extends GlobalProps {
    selectedView?: string;
}

interface ItemStatus {
    goal?: number;
    count: number;
}
interface Item {
    id: number;
    name: string;
    type: string;
    status: ItemStatus;
}
interface HistoryState {
    errorMsg?: string;
    items: Array<Item>;
}

class History extends React.Component<HistoryProps, HistoryState> {
    constructor(props: HistoryProps){
        super(props);
    }

    fetchItems(){
        if(this.props.selectedView === undefined){
            return;
        }

        const weeks = 6;
        const historyPath = "/history";

        var url = this.props.global.baseUrl + 
            ":" + this.props.global.port + 
            historyPath + "?view=" + this.props.selectedView;

        fetch(url, { method: "GET" }).then(resp => {
            if(!resp.ok){
                console.log(`Error ${resp.status} fetching history for view ${this.props.selectedView}: ${resp.statusText}`);
                this.setState({
                    errorMsg: "Error fetching history."
                });
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
            console.log(`Error fetching history for view ${this.props.selectedView}: ${err}`);
            this.setState({
                errorMsg: "Error fetching history."
            });
        });
    }

    render(){
        return (
            <Container>
                <Row className="content-header">
                    <Col>Showing history for last <b>6</b> weeks</Col>
                </Row>
            </Container>
        );
    }

    componentDidMount() {
        this.fetchItems();
    }
    componentDidUpdate(prevProps: HistoryProps) {
        if (this.props.selectedView !== prevProps.selectedView){
            this.fetchItems();
        }
    }
}

export default History;