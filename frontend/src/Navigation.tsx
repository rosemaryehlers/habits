import React from 'react';
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';

function Navigation() {
    return (
        <Container fluid>
            <Row>
                <Col>Due Date: Tomorrow</Col>
                <Col md='auto' sm='auto' xs='auto'>Settings</Col>
            </Row>
        </Container>
    );
}

export default Navigation;