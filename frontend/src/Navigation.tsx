import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import './Navigation.css';
import icongear from 'bootstrap-icons/icons/gear-fill.svg'
import Dropdown from 'react-bootstrap/Dropdown';
import Button from 'react-bootstrap/Button';

interface NavigationProps {
    dueDate: string;
    selectedView: string;
    views: Array<string>;
}

class Navigation extends React.Component<NavigationProps, {}> {
    render(){
        return (
            <Container fluid className='navigation'>
                <Row>
                    <Col className='left'>
                        <Dropdown>
                            <Dropdown.Toggle size='sm' variant='outline-primary' id='viewselector'>{this.props.selectedView}</Dropdown.Toggle>
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
                    <Col className='center'>
                        <label>Due:</label>{this.props.dueDate}
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