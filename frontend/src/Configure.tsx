import React, { useEffect, useState } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Col, Container, Row } from 'react-bootstrap';
import './Navigation.css';
import './Configure.css';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import { GlobalProps } from './GlobalProps';
import ConfigureViews from './ConfigureViews';
import ConfigureTasks from './ConfigureTasks';

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
        <>
            <Container fluid className='navigation-container'>
                <ButtonToolbar className="navbar" aria-label="Navigation">
                    <ButtonGroup aria-label="Action">
                        { renderActionButton("Views") }
                        { renderActionButton("Tasks") }
                    </ButtonGroup>
                </ButtonToolbar>

                <div className="content-header"></div>

                <Button className="configure" variant="outline-secondary" size="sm" onClick={ ()=> { props.global.onSelectedModeChange("Current"); } }>
                    <img src={iconback} alt='Back' />
                </Button>
            </Container>

            <>
                { selectedAction === "Views" &&
                    <ConfigureViews {...props} />
                }
                { selectedAction === "Tasks" &&
                    <ConfigureTasks {...props} />
                }
            </>
        </>
    );
}

export default Configure;