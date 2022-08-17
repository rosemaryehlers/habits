import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './Navigation.css';
import icongear from 'bootstrap-icons/icons/gear-fill.svg'
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';
import { GlobalProps } from './GlobalProps';

export interface NavigationProps extends GlobalProps {
    views: Array<string>;
    selectedView?: string;
    onSelectedViewChange(view: string): any;
}

class Navigation extends React.Component<NavigationProps, {}> {
    constructor(props: NavigationProps) {
        super(props);
    }

    onViewChange(e: any){
        console.log(e.target.value);
    }

    render(){
        return (
            <Container fluid className='navigation'>
                <Row>
                    <Col className='left'>
                        <Dropdown>
                            <Dropdown.Toggle onClick={this.onViewChange} id='viewselector' size='sm' variant='outline-primary'>{this.props.selectedView}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                <Dropdown.ItemText>Select View</Dropdown.ItemText>
                                <Dropdown.Divider />
                                {
                                    this.props.views.filter(v => v !== this.props.selectedView).map(view => (
                                    <Dropdown.Item href={"#/" + view}>{view}</Dropdown.Item>
                                    ))
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col className='right'>
                        <Button variant="outline-secondary" size="sm">
                            <img src={icongear} alt='Settings' className='icon gear' />
                        </Button>{' '}
                    </Col>
                </Row>
            </Container>
        );
    }
}

export default Navigation;