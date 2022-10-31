import React, { useState } from 'react';
import { Button, Col, Container, Dropdown, Form, Modal, Row, Stack } from 'react-bootstrap';
import './Navigation.css';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import { GlobalProps } from './GlobalProps';

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
                                            <Dropdown.Item value={view} key={view} onClick={onViewChange} >{view}</Dropdown.Item>
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
                    <div>Create new form</div>
                }
                { selectedView !== "Create New" &&
                    <div>Edit {selectedView}</div>
                }
            </Container>
        </div>
    );
}

export default EditViews;