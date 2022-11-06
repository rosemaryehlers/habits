import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Col, Container, Row } from 'react-bootstrap';
import './Navigation.css';
import './Configure.css';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import { GlobalProps } from './GlobalProps';
import ConfigureViews from './ConfigureViews';

function Configure(props: GlobalProps) {
    const [selectedAction, setSelectedAction] = useState("Views");

    function renderActionButton(action: string) {
        return (
            <Button
                onClick={() => { setSelectedAction(action) }}
                variant={ selectedAction === action ? "primary" : "outline-primary" }
            >{action}</Button>
        );
    }

    return (
        <div>
            <Container fluid className='navigation'>
                <Row>
                    <Col className='left'>
                        <ButtonToolbar aria-label="Navigation">
                            <ButtonGroup aria-label="Action">
                                { renderActionButton("Views") }
                                { renderActionButton("Tasks") }
                            </ButtonGroup>
                        </ButtonToolbar>
                    </Col>
                    <Col className='right'>
                            <Button variant="outline-secondary" size="sm" onClick={ ()=> { props.global.onSelectedModeChange("Current"); } }>
                                <img src={iconback} alt='Back' />
                            </Button>
                    </Col>
                </Row>
            </Container>
            <Container fluid className="edit">
                { selectedAction === "Views" &&
                    <ConfigureViews {...props} />
                }
                { selectedAction === "Tasks" &&
                    <div>Configure tasks</div>
                }
            </Container>
        </div>
    );
}

export default Configure;