import React, { useState } from 'react';
import { Button, ButtonGroup, ButtonToolbar, Col, Container, Dropdown, DropdownButton, Form, InputGroup, Modal, Row, Stack } from 'react-bootstrap';
import './Navigation.css';
import icongear from 'bootstrap-icons/icons/gear-fill.svg';
import { GlobalProps } from './GlobalProps';

export interface AppNavigationProps extends GlobalProps {
    defaultView?: string;
    selectedView?: string;
    selectedMode?: string;
    onSelectedViewChange(view: string): any;
    headerText?: JSX.Element;
}

function AppNavigation(props: AppNavigationProps) {
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    function onViewChange(e: any){
        props.onSelectedViewChange(e.target.text);
    }
    function onWeeksChange(e: any){
        console.log(e);
        e.preventDefault();
    }

    return (
        <Container fluid className='navigation-container'>

            <ButtonToolbar className="navbar" aria-label="App navigation">
                <ButtonGroup aria-label="Mode">
                    <Button size="sm" onClick={ () => {props.global.onSelectedModeChange("Current")} } variant={ props.selectedMode === "Current" ? "primary" : "outline-primary" } >Current</Button>
                    <Button size="sm" onClick={ () => {props.global.onSelectedModeChange("History")} } variant={ props.selectedMode === "History" ? "primary" : "outline-primary" }>History</Button>
                </ButtonGroup>
                <ButtonGroup aria-label="View">
                    <DropdownButton size="sm" as={ButtonGroup} variant="outline-primary" title={props.selectedView ?? "Loading"}>

                        <Dropdown.ItemText>Select View</Dropdown.ItemText>
                        <Dropdown.Divider />
                        {
                            props.global.views.filter(v => v !== props.selectedView).map(view => (
                            <Dropdown.Item onClick={onViewChange} value={view} key={view}>{view}</Dropdown.Item>
                            ))
                        }
                    </DropdownButton>
                </ButtonGroup>
            </ButtonToolbar>

            <div className="content-header">
                { props.selectedMode !== "History" &&
                    <span>{ props.headerText }</span>
                }
                { props.selectedMode === "History" &&
                    <InputGroup size="sm" aria-label="Weeks" className="weeks-input">
                        <InputGroup.Text id="historyWeeks">Weeks</InputGroup.Text>
                        <Form.Control disabled
                            defaultValue={6}
                            id="weeksInput"
                            onSubmit={ onWeeksChange }
                            type="text"
                            aria-label="Weeks input"
                            aria-describedby="historyWeeks" />
                    </InputGroup>
                }
            </div>

            <Button className="configure" variant="outline-secondary" size="sm" onClick={ () => { props.global.onSelectedModeChange("Configure"); } } >
                <img src={icongear} alt='Settings' />
            </Button>
    </Container>
    );
}

export default AppNavigation;