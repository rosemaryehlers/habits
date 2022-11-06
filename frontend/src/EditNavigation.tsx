import React, { useState } from 'react';
import { Button, Col, Container, Dropdown, Form, Modal, Row, Stack } from 'react-bootstrap';
import './Navigation.css';
import iconback from 'bootstrap-icons/icons/arrow-left.svg';
import { GlobalProps } from './GlobalProps';

export interface EditNavigationProps extends GlobalProps {
    onSelectedViewChange(view: string): any;
}

function EditNavigation(props: GlobalProps) {
    const temp = [...props.global.views];
    temp.unshift("Create New");
    const [viewList, setViewList] = useState<Array<string>>(temp);
    const [selectedView, setSelectedView] = useState("Create New");

    return (
        <Container fluid className='navigation'>
        <Row>
            <Col className='left'>
                <Dropdown>
                    <Dropdown.Toggle size='sm' variant='outline-primary'>{selectedView}</Dropdown.Toggle>
                    <Dropdown.Menu>
                        {
                            viewList.filter( v => v !== selectedView ).map(view => {
                                return (
                                    <Dropdown.Item value={view} key={view} >{view}</Dropdown.Item>
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
    );
}

export default EditNavigation;