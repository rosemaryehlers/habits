import React, { useState } from 'react';
import { Button, Col, Container, Dropdown, Form, Modal, Row, Stack } from 'react-bootstrap';
import './Navigation.css';
import icongear from 'bootstrap-icons/icons/gear-fill.svg';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import { GlobalProps } from './GlobalProps';

export interface NavigationProps {
    views: Array<string>;
    defaultView?: string;
    selectedView?: string;
    onSelectedViewChange(view: string): any;
    modes: Array<string>;
    selectedMode?: string;
    onSelectedModeChange(mode: string): any;
    headerText?: JSX.Element;
}
export interface CombinedNavigationProps extends GlobalProps, NavigationProps {
}

function Navigation(props: CombinedNavigationProps) {
    const [showSettingsModal, setShowSettingsModal] = useState(false);

    function onViewChange(e: any){
        props.onSelectedViewChange(e.target.text);
    }
    function onModeChange(e: any){
        props.onSelectedModeChange(e.target.text);
    }
    function onWeeksChange(e: any){
        console.log(e);
        e.preventDefault();
    }

    return (
        <Container fluid className='navigation'>
        <Row>
            <Col className='left'>
                <Dropdown>
                    <Dropdown.Toggle size='sm' variant='outline-primary'>{props.selectedView}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        <Dropdown.ItemText>Select View</Dropdown.ItemText>
                        <Dropdown.Divider />
                        {
                            props.views.filter(v => v !== props.selectedView).map(view => (
                            <Dropdown.Item onClick={onViewChange} value={view} key={view}>{view}</Dropdown.Item>
                            ))
                        }
                    </Dropdown.Menu>
                </Dropdown>
                <Dropdown>
                    <Dropdown.Toggle size='sm' variant='outline-primary'>{props.selectedMode}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {
                            props.modes.filter(m => m !== props.selectedMode).map(mode => (
                                <Dropdown.Item onClick={onModeChange} value={mode} key={mode}>{mode}</Dropdown.Item>
                            ))
                        }
                    </Dropdown.Menu>
                </Dropdown>
                { props.selectedMode === "History" &&
                <Form id="weeksInput" onSubmit={ onWeeksChange }>
                    <Form.Control disabled defaultValue={6} required size="sm"></Form.Control>
                    <Form.Text>weeks</Form.Text>
                </Form>
                }
            </Col>
            <Col className="center">
                { props.headerText }
            </Col>
            <Col className='right'>
                    { props.selectedMode === "edit" &&
                    <Button variant="outline-secondary" size="sm">
                        <img src={iconback} alt='Back' />
                    </Button>
                    }
                    { props.selectedMode !== "edit" &&
                    <Button variant="outline-secondary" size="sm" 
                        onClick={ () => { setShowSettingsModal(true); }} >
                        <img src={icongear} alt='Settings' />
                    </Button>
                    }
            </Col>
        </Row>

        <Modal 
            show={ showSettingsModal }
            className="settings-modal" size="sm" centered >
            <Modal.Body>
                <Stack>
                    <Button variant="outline-primary" onClick={ () => { props.onSelectedModeChange("edit"); } } >Edit Views</Button>
                    <Button variant="secondary" onClick={ () => { setShowSettingsModal(false); } } className="close" >Close</Button>
                </Stack>
            </Modal.Body>
        </Modal>
    </Container>
    );
}

export default Navigation;