import React, { useState } from 'react';
import { Button, Col, Container, Dropdown, Form, InputGroup, Modal, Row, Stack } from 'react-bootstrap';
import './Navigation.css';
import './Edit.css';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import { GlobalProps } from './GlobalProps';

interface ViewData {
    name: string;
    tasks: Array<string>;
}

function EditViews(props: GlobalProps) {
    const temp = [...props.global.views];
    temp.unshift("Create New");
    const [viewList, setViewList] = useState<Array<string>>(temp);
    const [selectedView, setSelectedView] = useState("Create New");

    function onViewChange(e: any){
        setSelectedView(e.target.text);
    }

    return (
        <div>
            <Container fluid className='navigation'>
                <Row>
                    <Col className='left'>
                        <Dropdown>
                            <Dropdown.Toggle size='sm' variant='outline-primary'>{selectedView}</Dropdown.Toggle>
                            <Dropdown.Menu>
                                {
                                    viewList.filter( v => v !== selectedView ).map(view => {
                                        return (
                                            <>
                                                <Dropdown.Item value={view} key={view} onClick={onViewChange} >{view}</Dropdown.Item>
                                                { view === "Create New" && <Dropdown.Divider></Dropdown.Divider> }
                                            </>
                                        );
                                    })
                                }
                            </Dropdown.Menu>
                        </Dropdown>
                    </Col>
                    <Col className='right'>
                            <Button variant="outline-secondary" size="sm" onClick={ ()=> { props.global.onSelectedModeChange("Current"); } }>
                                <img src={iconback} alt='Back' />
                            </Button>
                    </Col>
                </Row>
            </Container>
            <Container fluid className="edit">
                { selectedView === "Create New" &&
                    <div className="edit-form-container">
                        <div className="edit-form">
                            <InputGroup className="name">
                                <InputGroup.Text id="name">Name</InputGroup.Text>
                                <Form.Control aria-label="Name" aria-describedby="name"></Form.Control>
                            </InputGroup>
                        </div>
                        <div className="submit-container">
                            <Button variant="success">Create</Button>{' '}
                        </div>
                    </div>
                }
                { selectedView !== "Create New" &&
                    <div className="edit-form-container">
                        <div className="edit-form">
                            <div>Editing {selectedView}</div>
                        </div>
                    </div>
                }
            </Container>
        </div>
    );
}

export default EditViews;